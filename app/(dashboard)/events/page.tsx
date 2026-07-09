import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUpcomingEvents } from '@/lib/db/events'
import CreateEventForm from '@/components/events/CreateEventForm'
import EventCard from '@/components/events/EventCard'

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect('/onboarding')

  const events = await getUpcomingEvents(profile.org_id)

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold text-[#0b1c30]">
            Events
          </h1>
          <p className="text-[#584140] mt-1">Open invitations from your colleagues — join in</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events list */}
        <div className="lg:col-span-2 space-y-4">
          {events.length === 0 ? (
            <div className="glass-card momentum-shadow rounded-xl p-10 text-center">
              <p className="text-4xl mb-3">🏅</p>
              <p className="font-semibold text-[#0b1c30]">No upcoming events</p>
              <p className="text-sm text-[#584140] mt-1">Be the first to post one →</p>
            </div>
          ) : (
            events.map(event => (
              <EventCard
                key={event.id}
                event={event}
                userId={user.id}
              />
            ))
          )}
        </div>

        {/* Create event form */}
        <div>
          <CreateEventForm orgId={profile.org_id} userId={user.id} />
        </div>
      </div>
    </div>
  )
}
