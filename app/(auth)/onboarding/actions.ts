'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Profile } from '@/lib/types'

export async function completeOnboardingAction(orgId: string, opUnitId: string): Promise<ActionResult<Profile>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  // Server-side domain validation — prevents org_id spoofing
  const domain = user.email?.split('@')[1]
  if (!domain) return { data: null, error: 'Could not determine email domain' }

  const { data: org } = await supabase
    .from('organisations')
    .select('id, domain')
    .eq('id', orgId)
    .single()

  if (!org || org.domain !== domain) return { data: null, error: 'Organisation does not match your email domain' }

  const { data, error } = await supabase
    .from('profiles')
    .update({ org_id: orgId, op_unit_id: opUnitId, onboarded: true })
    .eq('id', user.id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Profile, error: null }
}
