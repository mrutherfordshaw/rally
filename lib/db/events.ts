'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Event, Rsvp } from '@/lib/types'

export async function getUpcomingEvents(orgId: string): Promise<Event[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('org_id', orgId)
    .gte('event_time', new Date().toISOString())
    .order('event_time', { ascending: true })
    .limit(20)

  return (data as Event[]) ?? []
}

export async function createEvent(payload: {
  org_id: string
  title: string
  activity_type: string
  description?: string
  event_time: string
  location?: string
  max_participants?: number
}): Promise<ActionResult<Event>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('events')
    .insert({ ...payload, creator_id: user.id })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Event, error: null }
}

export async function rsvpToEvent(eventId: string): Promise<ActionResult<Rsvp>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('rsvps')
    .upsert({ event_id: eventId, user_id: user.id, status: 'going' }, {
      onConflict: 'event_id,user_id'
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Rsvp, error: null }
}

export async function cancelRsvp(eventId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { error } = await supabase
    .from('rsvps')
    .update({ status: 'cancelled' })
    .eq('event_id', eventId)
    .eq('user_id', user.id)

  if (error) return { data: null, error: error.message }
  return { data: null, error: null }
}

export async function getEventRsvps(eventId: string): Promise<Rsvp[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('rsvps')
    .select('*')
    .eq('event_id', eventId)
    .eq('status', 'going')

  return (data as Rsvp[]) ?? []
}
