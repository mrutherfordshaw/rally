export type Role = 'user' | 'op_unit_admin' | 'org_admin' | 'app_admin'

export interface Organisation {
  id: string
  name: string
  domain: string
  created_at: string
}

export interface OpUnit {
  id: string
  org_id: string
  name: string
  created_at: string
}

export interface Profile {
  id: string
  org_id: string | null
  op_unit_id: string | null
  full_name: string | null
  role: Role
  onboarded: boolean
  created_at: string
}

export interface MetricType {
  id: string
  slug: string
  unit: string
  display_name: string
}

export interface MetricLog {
  id: string
  user_id: string
  org_id: string
  op_unit_id: string | null
  metric_type_id: string
  date: string
  value: number
  source: 'manual' | 'apple' | 'google'
  created_at: string
}

export interface Challenge {
  id: string
  org_id: string
  op_unit_id: string | null
  metric_type_id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  status: 'active' | 'completed' | 'cancelled'
  created_at: string
}

export interface Event {
  id: string
  org_id: string
  creator_id: string
  title: string
  activity_type: string
  description: string | null
  event_time: string
  location: string | null
  max_participants: number | null
  created_at: string
}

export interface Rsvp {
  id: string
  event_id: string
  user_id: string
  status: 'going' | 'cancelled'
  created_at: string
}

// View types
export interface LeaderboardUser {
  user_id: string
  full_name: string | null
  org_id: string
  op_unit_id: string | null
  op_unit_name: string | null
  total_steps: number
  rank: number
}

export interface LeaderboardOpUnit {
  op_unit_id: string
  name: string
  org_id: string
  member_count: number
  total_steps: number
  avg_steps_per_member: number
  rank: number
}

// Server Action response shape — never throw to the UI
export type ActionResult<T = null> =
  | { data: T; error: null }
  | { data: null; error: string }
