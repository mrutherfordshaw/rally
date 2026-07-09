-- ============================================================
-- Rally — Demo Seed Data
-- Populates a convincing demo state for the hackathon pitch
-- Run AFTER the initial schema migration
-- ============================================================

-- Organisations
insert into public.organisations (id, name, domain) values
  ('11111111-1111-1111-1111-111111111111', 'Deloitte', 'deloitte.com'),
  ('22222222-2222-2222-2222-222222222222', 'Accenture', 'accenture.com');

-- Op Units (Deloitte)
insert into public.op_units (id, org_id, name) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Customer'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Engineering AI & Data'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Tax & Legal'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'Audit & Assurance'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'Risk Advisory');

-- Active org-wide challenge (Deloitte)
insert into public.challenges (id, org_id, op_unit_id, metric_type_id, name, description, start_date, end_date, status)
values (
  'chall111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  null,
  (select id from public.metric_types where slug = 'steps'),
  'Summer Step Sprint',
  'July challenge — which division walks the most? Top division wins bragging rights and a team lunch.',
  '2026-07-01',
  '2026-07-31',
  'active'
);

-- Sample events
insert into public.events (org_id, creator_id, title, activity_type, description, event_time, location, max_participants)
select
  '11111111-1111-1111-1111-111111111111',
  (select id from public.profiles limit 1),
  'Lunchtime Run — Castlefield',
  'Running',
  'Easy 5k along the canal. All paces welcome, we regroup at the end.',
  now() + interval '2 days',
  'Castlefield Basin, Manchester',
  12
where exists (select 1 from public.profiles limit 1);

insert into public.events (org_id, creator_id, title, activity_type, description, event_time, location, max_participants)
select
  '11111111-1111-1111-1111-111111111111',
  (select id from public.profiles limit 1),
  'Padel — Deansgate',
  'Padel',
  '2 courts booked, 3 spots left. Beginners welcome!',
  now() + interval '4 days',
  'Manchester Padel Club, Deansgate',
  8
where exists (select 1 from public.profiles limit 1);
