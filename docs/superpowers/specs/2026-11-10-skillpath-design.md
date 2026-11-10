# SkillPath MVP — design (2026-11-10)

## What it is
Pick a skill, a level and the hours you have each week; get an ordered path of existing videos,
courses and tutorials grouped into weeks. Nothing is hosted. Paths that people finish rise in the
ranking. First skill: Excel.

## Stack
Next.js 16 (App Router, `src/`), TypeScript, Tailwind v4, Supabase (Postgres, RLS, magic-link auth),
Vercel. No model anywhere: placement is a rule, ranking is arithmetic, URLs are curated by a human.

## Data (all tables RLS on)
| table | columns | access |
|---|---|---|
| skills | id, slug, name | read: everyone. write: service role |
| resources | id, skill_id, title, url, platform, hours, level, completion_rate | read: everyone. write: service role |
| paths | id, skill_id, level, title, resource_ids uuid[] | read: everyone. write: service role |
| learner_profiles | user_id, hours_per_week, deadline (nullable) | own rows only |
| enrollments | id, user_id, path_id, resource_ids uuid[], current_index | own rows only |
| events | id, user_id, resource_id, type, created_at | own rows only |
| waitlist | id, email, created_at | no client access; server inserts with service role |

Two columns beyond the brief, both needed to hold spec'd behaviour:
- `learner_profiles.deadline` stores the quiz's optional deadline.
- `enrollments.resource_ids` snapshots the order assembled at enrollment (sorted by completion_rate)
  so later recomputes change the order for *new* learners only, and swaps have somewhere to live.

`level` and `type` are Postgres enums. `completion_rate` defaults to 0.5 = (0+1)/(0+0+2).

## Rules
- Placement: the path whose `level` equals the quiz answer. Nothing else.
- Assembly: `path.resource_ids` → resources, stable-sorted by `completion_rate` desc (ties keep curated order).
- Grouping: walk the ordered list; a week holds ≤ 1.2 × hours_per_week. A single resource longer than
  the cap spans consecutive weeks (hours_per_week per week, remainder last) so the invariant always holds.
- Recompute: `completion_rate = (completed + 1) / (completed + abandoned + 2)` per resource, as one SQL
  function. Triggered by the admin button or `POST /api/recompute` with `Authorization: Bearer RECOMPUTE_SECRET`.
- Abandon: record `abandoned`; pick the highest-rated resource of the same skill+level with
  `hours < current.hours` that is not already in the enrollment; replace in place. None → message
  "We'll add one. Skip to the next." and a Skip button.
- Counts: under 10 events show "2 of 3 people finish this"; otherwise a percentage.

## Screens
`/` landing + waitlist · `/login` magic link · `/auth/confirm` code exchange · `/quiz` · `/learn/[skill]/[level]` weekly breakdown · `/today` current resource · `/admin/resources` (email allowlist via `ADMIN_EMAILS`).
Empty state: `/today` and `/learn/*` with no enrollment redirect to `/quiz`.

## Env
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only),
`ADMIN_EMAILS`, `RECOMPUTE_SECRET`.

## Testing
Vitest unit tests for grouping (1/3/5/10 h), placement, assembly ordering and the swap rule.
Manual: sign in via local Mailpit, run the quiz, abandon, recompute, check waitlist row.

## Out of scope
Billing, plans, affiliate links, CMS, analytics, video hosting, any model.
