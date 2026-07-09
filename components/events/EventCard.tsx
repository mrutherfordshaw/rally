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
  Swimming: '🏊',
  default: '🏅',
}

export default function EventCard({ event, userId }: { event: Event; userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const icon = activityIcons[event.activity_type] ?? activityIcons.default
  const date = new Date(event.event_time)
  const isOwner = event.creator_id === userId

  async function handleRsvp() {
    setLoading(true)
    await rsvpToEvent(event.id)
    setLoading(false)
    router.refresh()
  }

  async function handleCancel() {
    setLoading(true)
    await cancelRsvp(event.id)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="glass-card momentum-shadow rounded-xl p-5 flex gap-4">
      <div className="w-12 h-12 rounded-xl bg-[#eff4ff] flex items-center justify-center text-2xl flex-shrink-0">
        {icon}
      </div>

      <div className="flex-grow min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-[family-name:var(--font-montserrat)] font-semibold text-[#0b1c30]">
              {event.title}
            </h3>
            <p className="text-xs text-[#584140] mt-0.5">
              {event.activity_type}
              {event.location && ` · ${event.location}`}
            </p>
          </div>
          <span className="text-xs bg-[#eff4ff] text-[#005db8] font-semibold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
            {date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>

        {event.description && (
          <p className="text-sm text-[#584140] mt-2">{event.description}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3 text-xs text-[#584140]">
            <span>
              {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {event.max_participants && (
              <span>· {event.max_participants} spots max</span>
            )}
          </div>

          {isOwner ? (
            <span className="text-xs text-[#584140] bg-[#e5eeff] px-3 py-1 rounded-full">
              Your event
            </span>
          ) : (
            <button
              onClick={handleRsvp}
              disabled={loading}
              className="text-sm font-semibold text-white vibrant-gradient-coral px-4 py-1.5 rounded-full hover:brightness-110 transition-all active:scale-95 disabled:opacity-60"
            >
              {loading ? '…' : "I'm in 👍"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
