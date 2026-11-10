# SkillPath MVP — plan (2026-11-10)

Design = the user's spec (three messages: MVP, core feature, landing page). Assumptions I made:
- Local Supabase (Docker) is the dev database; schema lives in `supabase/migrations`, data in `supabase/seed.sql`.
- Vercel deploy needs an interactive `vercel login`, so I prepare the project and document the steps.
- Weekly grouping is pure arithmetic in `src/lib/grouping.ts`; placement is `level` match in `src/lib/placement.ts`.
- Admin page is gated by an `ADMIN_EMAILS` env var (comma separated) so curators are not hardcoded.
- Recompute route is protected by `RECOMPUTE_SECRET` bearer token; the button calls a server action as an admin.

## Phase 1 — foundation
- [x] Next.js 16 scaffold, Tailwind v4, Geist
- [x] Supabase local: init, migrations for 6 tables + waitlist, RLS policies, start
- [x] Supabase clients (browser, server, service role), middleware session refresh
- [x] Magic-link sign-in page + auth callback
- [x] `.env.local` + `.env.example`

## Phase 2 — core feature
- [x] Verify every seed URL (curl + YouTube oEmbed) → `supabase/seed.sql` with 3 Excel paths
- [x] `grouping.ts` + vitest for 1/3/5/10 h
- [x] `placement.ts` + `assemblePath` sorted by completion_rate (stable)
- [x] `/quiz` → creates learner_profile + enrollment → `/learn/[skill]/[level]`
- [x] `/learn/[skill]/[level]` shows weekly breakdown
- [x] `/today`: current resource, minutes, Started / Done / Not for me (swap or skip message)
- [x] Recompute: SQL function + `/api/recompute` (bearer) + admin button
- [x] `/admin/resources`: completion rate, counts, "2 of 3 people finish this" under 10 events, remove button

## Phase 3 — landing
- [x] `/` landing: hero, sample path with weeks, 4 steps, FAQ, waitlist form → `waitlist` table
- [x] Phone-width check

## Verification
- [x] `npm run dev` starts, sign in works (local Mailpit)
- [x] grouping tests pass; placement returns right level
- [x] abandon swaps shorter resource or shows skip message
- [x] Recompute changes order for new learner
- [x] waitlist row appears after submit

## Review (2026-11-10)
Verified in a real browser against local Supabase: magic-link sign-in (Mailpit), empty state → quiz,
placement → beginner path, 2 weeks at 3 h (3h32 / 3h10, both under 3.6), Started/Done events,
abandon swapped in "Excel Course for Beginners: Lesson 1" (9 min), second abandon showed
"We'll add one. Skip to the next.", Recompute set 67% / 33% and moved the abandoned video to the
end of a new learner's path, waitlist row written, landing renders at 382 px without overflow.
28 unit tests pass (grouping 1/3/5/10 h, placement, swap rule, count formatting).
Not done: Vercel deploy (needs an interactive `vercel login`); steps are in README.md.
