'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Challenge } from '@/lib/types'

export async function getActiveOrgChallenge(orgId: string): Promise<Challenge | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('challenges')
    .select('*')
    .eq('org_id', orgId)
    .eq('status', 'active')
    .is('op_unit_id', null)
    .single()

  return data as Challenge | null
}

export async function getActiveUnitChallenge(opUnitId: string): Promise<Challenge | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('challenges')
    .select('*')
    .eq('op_unit_id', opUnitId)
    .eq('status', 'active')
    .single()

  return data as Challenge | null
}

export async function createChallenge(payload: {
  org_id: string
  op_unit_id?: string | null
  metric_type_id: string
  name: string
  description?: string
  start_date: string
  end_date: string
}): Promise<ActionResult<Challenge>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, org_id')
    .eq('id', user.id)
    .single()

  if (!['org_admin', 'app_admin'].includes(profile?.role ?? '')) return { data: null, error: 'Forbidden' }
  if (payload.org_id !== profile?.org_id) return { data: null, error: 'Forbidden' }

  const { data, error } = await supabase
    .from('challenges')
    .insert(payload)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Challenge, error: null }
}

export async function getOrgChallenges(orgId: string): Promise<Challenge[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('challenges')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  return (data as Challenge[]) ?? []
}
