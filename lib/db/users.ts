'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { ActionResult, Profile, Organisation, OpUnit } from '@/lib/types'

export async function updateProfile(payload: Partial<Profile>): Promise<ActionResult<Profile>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', user.id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Profile, error: null }
}

export async function completeOnboarding(payload: {
  org_id: string
  op_unit_id: string
  full_name: string
}): Promise<ActionResult<Profile>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...payload, onboarded: true })
    .eq('id', user.id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Profile, error: null }
}

export async function getOrganisationByDomain(domain: string): Promise<Organisation | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('organisations')
    .select('*')
    .eq('domain', domain)
    .single()

  return data as Organisation | null
}

export async function getOpUnitsForOrg(orgId: string): Promise<OpUnit[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('op_units')
    .select('*')
    .eq('org_id', orgId)
    .order('name')

  return (data as OpUnit[]) ?? []
}

export async function getOrgStats(orgId: string) {
  const supabase = await createClient()

  const [{ count: memberCount }, { data: opUnits }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('org_id', orgId),
    supabase.from('op_units').select('*').eq('org_id', orgId),
  ])

  return {
    memberCount: memberCount ?? 0,
    opUnitCount: opUnits?.length ?? 0,
  }
}

// Service-role only — used by app admin
export async function createOrganisation(payload: {
  name: string
  domain: string
}): Promise<ActionResult<Organisation>> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('organisations')
    .insert(payload)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Organisation, error: null }
}

export async function createOpUnit(payload: {
  org_id: string
  name: string
}): Promise<ActionResult<OpUnit>> {
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
    .from('op_units')
    .insert(payload)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as OpUnit, error: null }
}
