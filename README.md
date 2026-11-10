# SkillPath

Pick a skill, a level and the hours you have each week. Get an ordered path of existing videos,
courses and docs, grouped into weeks. Nothing is hosted here. Paths that people finish rise in the ranking.

First skill: Excel (three paths: beginner, intermediate, advanced).

## Stack

Next.js 16 (App Router), TypeScript, Tailwind v4, Supabase (Postgres, Row Level Security, magic-link auth), Vercel.
Placement is a rule (level match). Ranking is arithmetic. No model touches a URL or a ranking.

## Run locally

Requires Node 20+ and Docker (for local Supabase).

```bash
npm install
npx supabase start          # starts Postgres, Auth, Mailpit; applies migrations and seed.sql
cp .env.example .env.local  # then fill in the values printed by `npx supabase status`
npm run dev                 # http://127.0.0.1:3000
```

Magic-link emails land in Mailpit at http://127.0.0.1:54324. Open the link on the same host you used
for the app (127.0.0.1 or localhost), since the session cookie is host-bound.

Reset the database (re-applies migrations and seed): `npm run db:reset`.

## Environment variables

| name | where | purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | anon key; every query runs under RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | admin page, recompute, waitlist insert |
| `ADMIN_EMAILS` | server only | comma-separated curator emails allowed on `/admin/resources` |
| `RECOMPUTE_SECRET` | server only | bearer token for `POST /api/recompute` |
| `NEXT_PUBLIC_SITE_URL` | server | fallback origin for magic-link redirects |

## Screens

- `/` landing with a sample path, how it works, FAQ and waitlist
- `/login` magic link
- `/quiz` skill, level, hours per week (1, 3, 5, 10), optional deadline
- `/learn/[skill]/[level]` the path grouped into weeks (no week over 1.2 × your hours)
- `/today` current resource with Started, Done, "This wasn't for me"
- `/admin/resources` completion rates, event counts, Remove, Recompute

## Rules

- **Placement**: the path whose `level` matches the quiz answer.
- **Assembly**: the path's resources sorted by `completion_rate` descending, stable on the curated order.
  The order is snapshotted on the enrollment, so recompute changes the order for new learners only.
- **Grouping**: greedy, in order; a week holds at most 1.2 × hours per week. A resource longer than that
  spans consecutive weeks. Unit-tested for 1, 3, 5 and 10 hours in `src/lib/grouping.test.ts`.
- **Abandon**: records an `abandoned` event, then swaps in the best-rated resource of the same skill and
  level with fewer hours that is not already in your path. None → "We'll add one. Skip to the next."
- **Recompute**: `completion_rate = (completed + 1) / (completed + abandoned + 2)` in one SQL function.
  Trigger it with the admin button or `curl -X POST -H "Authorization: Bearer $RECOMPUTE_SECRET" /api/recompute`.
- **Counts**: under 10 events the UI says "2 of 3 people finish this"; from 10 it shows a percentage.

## Tests

```bash
npm test
```

## Deploy on Vercel

1. Create a Supabase project. In the SQL editor run `supabase/migrations/20261110000000_init.sql`, then
   `supabase/seed.sql` (or `npx supabase link` + `npx supabase db push` and run the seed).
2. In Supabase Auth → URL configuration, set the site URL to your Vercel domain and add
   `https://<your-domain>/auth/confirm` to the redirect allow list.
3. `vercel link`, then add the six environment variables above in the Vercel project (service role key,
   admin emails and recompute secret as server-only).
4. `vercel --prod`.

## Adding resources

Open the URL yourself first. Insert a row in `resources` with real `hours`, then add its id to the
matching `paths.resource_ids` array if it belongs in the curated path; otherwise it sits in the pool
and can be swapped in when someone abandons a longer resource of that level.
