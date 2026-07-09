-- ============================================================
-- Rally — Initial Schema Migration
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ORGANISATIONS
-- ============================================================
create table public.organisations (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  domain      text not null unique, -- domain-locked: only @domain emails can join
  created_at  timestamptz not null default now()
);

-- ============================================================
-- OP UNITS (business divisions within an org)
-- ============================================================
create table public.op_units (
  id      uuid primary key default uuid_generate_v4(),
  org_id  uuid not null references public.organisations(id) on delete cascade,
  name    text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  org_id      uuid references public.organisations(id) on delete set null,
  op_unit_id  uuid references public.op_units(id) on delete set null,
  full_name   text,
  role        text not null default 'user'
                check (role in ('user', 'op_unit_admin', 'org_admin', 'app_admin')),
  onboarded   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- METRIC TYPES (generic — steps, water, sleep, etc.)
-- ============================================================
create table public.metric_types (
  id           uuid primary key default uuid_generate_v4(),
  slug         text not null unique,
  unit         text not null,
  display_name text not null
);

-- Seed steps as the only MVP metric type
insert into public.metric_types (slug, unit, display_name)
values ('steps', 'count', 'Steps');

-- ============================================================
-- METRIC LOGS (all health data goes here)
-- ============================================================
create table public.metric_logs (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  org_id         uuid not null references public.organisations(id) on delete cascade,
  op_unit_id     uuid references public.op_units(id) on delete set null,
  metric_type_id uuid not null references public.metric_types(id),
  date           date not null,
  value          integer not null check (value >= 0),
  source         text not null default 'manual'
                   check (source in ('manual', 'apple', 'google')),
  created_at     timestamptz not null default now(),
  unique (user_id, metric_type_id, date) -- one log per user per metric per day
);

-- ============================================================
-- CHALLENGES (org-wide and unit-level separately)
-- ============================================================
create table public.challenges (
  id             uuid primary key default uuid_generate_v4(),
  org_id         uuid not null references public.organisations(id) on delete cascade,
  op_unit_id     uuid references public.op_units(id) on delete cascade, -- null = org-wide
  metric_type_id uuid not null references public.metric_types(id),
  name           text not null,
  description    text,
  start_date     date not null,
  end_date       date not null,
  status         text not null default 'active'
                   check (status in ('active', 'completed', 'cancelled')),
  created_at     timestamptz not null default now(),
  check (end_date > start_date)
);

-- One active org-wide challenge per org at a time
create unique index one_active_org_challenge
  on public.challenges (org_id)
  where (status = 'active' and op_unit_id is null);

-- One active unit-level challenge per op unit at a time
create unique index one_active_unit_challenge
  on public.challenges (op_unit_id)
  where (status = 'active' and op_unit_id is not null);

-- ============================================================
-- EVENTS (social activity invitations)
-- ============================================================
create table public.events (
  id               uuid primary key default uuid_generate_v4(),
  org_id           uuid not null references public.organisations(id) on delete cascade,
  creator_id       uuid not null references public.profiles(id) on delete cascade,
  title            text not null,
  activity_type    text not null,
  description      text,
  event_time       timestamptz not null,
  location         text,
  max_participants integer,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- RSVPS
-- ============================================================
create table public.rsvps (
  id        uuid primary key default uuid_generate_v4(),
  event_id  uuid not null references public.events(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  status    text not null default 'going' check (status in ('going', 'cancelled')),
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.organisations   enable row level security;
alter table public.op_units        enable row level security;
alter table public.profiles        enable row level security;
alter table public.metric_logs     enable row level security;
alter table public.challenges      enable row level security;
alter table public.events          enable row level security;
alter table public.rsvps           enable row level security;

-- Helper function to get current user's org_id
create or replace function public.my_org_id()
returns uuid language sql stable security definer as $$
  select org_id from public.profiles where id = auth.uid()
$$;

-- Helper function to get current user's role
create or replace function public.my_role()
returns text language sql stable security definer as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ORGANISATIONS policies
create policy "Users can view their own org"
  on public.organisations for select
  using (id = public.my_org_id());

create policy "App admins can view all orgs"
  on public.organisations for select
  using (public.my_role() = 'app_admin');

create policy "App admins can insert orgs"
  on public.organisations for insert
  with check (public.my_role() = 'app_admin');

create policy "App admins can update orgs"
  on public.organisations for update
  using (public.my_role() = 'app_admin');

-- OP UNITS policies
create policy "Users can view op units in their org"
  on public.op_units for select
  using (org_id = public.my_org_id());

create policy "Org admins can manage op units"
  on public.op_units for all
  using (
    org_id = public.my_org_id() and
    public.my_role() in ('org_admin', 'app_admin')
  );

-- PROFILES policies
create policy "Users can view profiles in their org"
  on public.profiles for select
  using (org_id = public.my_org_id() or id = auth.uid());

create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "Service role can insert profiles"
  on public.profiles for insert
  with check (true);

-- METRIC LOGS policies
create policy "Users can view metric logs in their org"
  on public.metric_logs for select
  using (org_id = public.my_org_id());

create policy "Users can insert their own metric logs"
  on public.metric_logs for insert
  with check (user_id = auth.uid() and org_id = public.my_org_id());

create policy "Users can update their own metric logs"
  on public.metric_logs for update
  using (user_id = auth.uid());

-- CHALLENGES policies
create policy "Users can view challenges in their org"
  on public.challenges for select
  using (org_id = public.my_org_id());

create policy "Org admins can manage org-wide challenges"
  on public.challenges for all
  using (
    org_id = public.my_org_id() and
    public.my_role() in ('org_admin', 'app_admin')
  );

create policy "Op unit admins can manage their unit challenges"
  on public.challenges for all
  using (
    org_id = public.my_org_id() and
    public.my_role() in ('op_unit_admin', 'org_admin', 'app_admin')
  );

-- EVENTS policies
create policy "Users can view events in their org"
  on public.events for select
  using (org_id = public.my_org_id());

create policy "Users can create events in their org"
  on public.events for insert
  with check (org_id = public.my_org_id() and creator_id = auth.uid());

create policy "Event creators can update their events"
  on public.events for update
  using (creator_id = auth.uid());

-- RSVPS policies
create policy "Users can view RSVPs for events in their org"
  on public.rsvps for select
  using (
    exists (
      select 1 from public.events e
      where e.id = event_id and e.org_id = public.my_org_id()
    )
  );

create policy "Users can manage their own RSVPs"
  on public.rsvps for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- LEADERBOARD VIEWS
-- ============================================================

-- User leaderboard: total steps per user in current org-wide active challenge
create or replace view public.leaderboard_users as
select
  p.id as user_id,
  p.full_name,
  p.org_id,
  p.op_unit_id,
  ou.name as op_unit_name,
  coalesce(sum(ml.value), 0) as total_steps,
  rank() over (partition by p.org_id order by coalesce(sum(ml.value), 0) desc) as rank
from public.profiles p
left join public.op_units ou on ou.id = p.op_unit_id
left join public.metric_logs ml on ml.user_id = p.id
  and ml.metric_type_id = (select id from public.metric_types where slug = 'steps')
where p.org_id is not null
group by p.id, p.full_name, p.org_id, p.op_unit_id, ou.name;

-- Op unit leaderboard: average steps per member (fairness metric)
create or replace view public.leaderboard_op_units as
select
  ou.id as op_unit_id,
  ou.name,
  ou.org_id,
  count(distinct p.id) as member_count,
  coalesce(sum(ml.value), 0) as total_steps,
  case
    when count(distinct p.id) > 0
    then coalesce(sum(ml.value), 0) / count(distinct p.id)
    else 0
  end as avg_steps_per_member,
  rank() over (partition by ou.org_id order by
    case
      when count(distinct p.id) > 0
      then coalesce(sum(ml.value), 0) / count(distinct p.id)
      else 0
    end desc
  ) as rank
from public.op_units ou
left join public.profiles p on p.op_unit_id = ou.id
left join public.metric_logs ml on ml.user_id = p.id
  and ml.metric_type_id = (select id from public.metric_types where slug = 'steps')
group by ou.id, ou.name, ou.org_id;

-- ============================================================
-- TRIGGER: auto-create profile on user signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
