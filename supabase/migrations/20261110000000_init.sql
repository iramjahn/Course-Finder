-- SkillPath schema. Row Level Security is on for every table.

create type public.resource_level as enum ('beginner', 'intermediate', 'advanced');
create type public.event_type as enum ('started', 'completed', 'abandoned');

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.skills(id) on delete cascade,
  title text not null,
  url text not null,
  platform text not null,
  hours numeric(6,2) not null check (hours > 0),
  level public.resource_level not null,
  completion_rate numeric(6,4) not null default 0.5,
  created_at timestamptz not null default now()
);
create index resources_skill_level_idx on public.resources (skill_id, level);

create table public.paths (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.skills(id) on delete cascade,
  level public.resource_level not null,
  title text not null,
  resource_ids uuid[] not null default '{}',
  unique (skill_id, level)
);

create table public.learner_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  hours_per_week integer not null check (hours_per_week in (1, 3, 5, 10)),
  deadline date,
  updated_at timestamptz not null default now()
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  path_id uuid not null references public.paths(id) on delete cascade,
  resource_ids uuid[] not null default '{}',
  current_index integer not null default 0 check (current_index >= 0),
  created_at timestamptz not null default now()
);
create index enrollments_user_idx on public.enrollments (user_id, created_at desc);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  type public.event_type not null,
  created_at timestamptz not null default now()
);
create index events_resource_idx on public.events (resource_id, type);
create index events_user_idx on public.events (user_id, created_at desc);

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);

-- Row Level Security -------------------------------------------------------
alter table public.skills enable row level security;
alter table public.resources enable row level security;
alter table public.paths enable row level security;
alter table public.learner_profiles enable row level security;
alter table public.enrollments enable row level security;
alter table public.events enable row level security;
alter table public.waitlist enable row level security;

-- Catalog: readable by everyone, writable only by the service role (bypasses RLS).
create policy "skills are public" on public.skills for select to anon, authenticated using (true);
create policy "resources are public" on public.resources for select to anon, authenticated using (true);
create policy "paths are public" on public.paths for select to anon, authenticated using (true);

-- Learner data: a learner reads and writes only their own rows.
create policy "own profile select" on public.learner_profiles for select to authenticated using (user_id = auth.uid());
create policy "own profile insert" on public.learner_profiles for insert to authenticated with check (user_id = auth.uid());
create policy "own profile update" on public.learner_profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own enrollments select" on public.enrollments for select to authenticated using (user_id = auth.uid());
create policy "own enrollments insert" on public.enrollments for insert to authenticated with check (user_id = auth.uid());
create policy "own enrollments update" on public.enrollments for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own events select" on public.events for select to authenticated using (user_id = auth.uid());
create policy "own events insert" on public.events for insert to authenticated with check (user_id = auth.uid());

-- waitlist: no client policies. The server inserts with the service role.

-- Ranking --------------------------------------------------------------------
-- completion_rate = (completed + 1) / (completed + abandoned + 2). Plain arithmetic, no model.
create or replace function public.recompute_completion_rates()
returns integer
language sql
security definer
set search_path = public
as $$
  with counts as (
    select r.id,
           count(e.id) filter (where e.type = 'completed') as completed,
           count(e.id) filter (where e.type = 'abandoned') as abandoned
    from public.resources r
    left join public.events e on e.resource_id = r.id
    group by r.id
  ),
  updated as (
    update public.resources r
    set completion_rate = round((c.completed + 1.0) / (c.completed + c.abandoned + 2.0), 4)
    from counts c
    where c.id = r.id
    returning r.id
  )
  select count(*)::integer from updated;
$$;
revoke all on function public.recompute_completion_rates() from public, anon, authenticated;

-- Aggregate finish counts per resource. Readable by everyone; exposes no user ids.
-- The view runs with its owner privileges (not security_invoker), so RLS on events does not hide other learners.
create view public.resource_stats as
select r.id,
       r.skill_id,
       r.title,
       r.url,
       r.platform,
       r.hours,
       r.level,
       r.completion_rate,
       count(e.id) filter (where e.type = 'started')   as started,
       count(e.id) filter (where e.type = 'completed') as completed,
       count(e.id) filter (where e.type = 'abandoned') as abandoned
from public.resources r
left join public.events e on e.resource_id = r.id
group by r.id;
grant select on public.resource_stats to anon, authenticated;
