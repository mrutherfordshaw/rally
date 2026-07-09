'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { ActionResult, MetricLog } from '@/lib/types'

export async function logMetric(payload: {
  metric_type_id: string
  date: string
  value: number
  source: 'manual' | 'apple' | 'google'
  org_id: string
  op_unit_id: string | null
}): Promise<ActionResult<MetricLog>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  // Always resolve metric_type_id via service role to avoid RLS issues
  const service = createServiceClient()
  const { data: mt } = await service.from('metric_types').select('id').eq('slug', 'steps').single()
  if (!mt?.id) return { data: null, error: 'Steps metric type not found in database.' }
  payload.metric_type_id = mt.id

  // Upsert — if a log exists for this user/metric/date, update it
  const { data, error } = await supabase
    .from('metric_logs')
    .upsert({
      user_id: user.id,
      org_id: payload.org_id,
      op_unit_id: payload.op_unit_id,
      metric_type_id: payload.metric_type_id,
      date: payload.date,
      value: payload.value,
      source: payload.source,
    }, {
      onConflict: 'user_id,metric_type_id,date',
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as MetricLog, error: null }
}

export async function getStepHistory(userId: string, days: number = 30): Promise<MetricLog[]> {
  const supabase = await createClient()
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('metric_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: false })

  if (error) return []
  return data as MetricLog[]
}

export async function getTodaySteps(userId: string): Promise<number> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('metric_logs')
    .select('value')
    .eq('user_id', userId)
    .eq('date', today)
    .single()

  return data?.value ?? 0
}

export async function getWeekSteps(userId: string): Promise<number> {
  const supabase = await createClient()
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const { data } = await supabase
    .from('metric_logs')
    .select('value')
    .eq('user_id', userId)
    .gte('date', weekAgo.toISOString().split('T')[0])

  return data?.reduce((sum, log) => sum + log.value, 0) ?? 0
}
