'use server'

import { createClient } from '@/lib/supabase/server'
import type { LeaderboardUser, LeaderboardOpUnit } from '@/lib/types'

export async function getLeaderboardUsers(orgId: string): Promise<LeaderboardUser[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leaderboard_users')
    .select('*')
    .eq('org_id', orgId)
    .order('rank', { ascending: true })
    .limit(50)

  if (error) return []
  return data as LeaderboardUser[]
}

export async function getLeaderboardOpUnits(orgId: string): Promise<LeaderboardOpUnit[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leaderboard_op_units')
    .select('*')
    .eq('org_id', orgId)
    .order('rank', { ascending: true })

  if (error) return []
  return data as LeaderboardOpUnit[]
}

export async function getUserRank(userId: string, orgId: string): Promise<number | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('leaderboard_users')
    .select('rank')
    .eq('user_id', userId)
    .eq('org_id', orgId)
    .single()

  return data?.rank ?? null
}
