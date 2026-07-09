'use client'

import { useState } from 'react'
import { rsvpToEvent, cancelRsvp } from '@/lib/db/events'
import { useRouter } from 'next/navigation'
import type { Event } from '@/lib/types'

const activityIcons: Record<string, string> = {
  Running: '🏃',
  Padel: '🎾',
  Cycling: '🚴',
  Gym: '🏋️',
  Walking: '🚶',
  Yoga: '🧘',
  Football: '⚽',
  default: '🏅',
}

interface Props {
  events: Event[]
  userId: string
}

export default function EventsFeed({ events, userId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleRsvp(eventId: string) {
    setLoading(eventId)
    await rsvpToEvent(eventId)
    setLoading(null)
    router.refresh()
  }

  async function handleCancel(eventId: string) {
    setLoading(eventId)
    await cancelRsvp(eventId)
    setLoading(null)
    router.refresh()
  }

  return (
    <div className="glass-card momentum-shadow rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[#e0bfbd] flex items-center justify-between">
        <div>
          <h3 className="font-[family-name:var(--font-montserrat)] font-semibold text-[#0b1c30]">
            Upcoming Events
          </h3>
          <p className="text-xs text-[#584140] mt-0.5">Open invitations from your colleagues</p>
        </div>
        <a href="/events" className="text-sm text-[#005db8] font-semibold hover:underline">
          View all
        </a>
      </div>

      <div className="divide-y divide-[#eff4ff]">
        {events.slice(0, 4).map(event => {
          const icon = activityIcons[event.activity_type] ?? activityIcons.default
          const date = new Date(event.event_time)

          return (
            <div key={event.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#eff4ff] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#eff4ff] flex items-center justify-center text-xl flex-shrink-0">
                {icon}
              </div>

              <div className="flex-grow min-w-0">
                <p className="text-sm font-semibold text-[#0b1c30] truncate">{event.title}</p>
                <p className="text-xs text-[#584140]">
                  {date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                  {' · '}
                  {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  {event.location && ` · ${event.location}`}
                </p>
              </div>

              {event.creator_id === userId ? (
                <span className="text-xs text-[#584140] bg-[#e5eeff] px-2 py-1 rounded-full whitespace-nowrap">
                  Your event
                </span>
              ) : (
                <button
                  onClick={() => handleRsvp(event.id)}
                  disabled={loading === event.id}
                  className="text-xs font-semibold text-white vibrant-gradient-blue px-4 py-1.5 rounded-full hover:brightness-110 transition-all active:scale-95 disabled:opacity-60 whitespace-nowrap"
                >
                  {loading === event.id ? '…' : "I'm in"}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
