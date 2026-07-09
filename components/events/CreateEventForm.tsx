'use client'

import { useState } from 'react'
import { createEvent } from '@/lib/db/events'
import { useRouter } from 'next/navigation'

const ACTIVITY_TYPES = ['Running', 'Padel', 'Cycling', 'Gym', 'Walking', 'Yoga', 'Football', 'Swimming', 'Other']

export default function CreateEventForm({ orgId, userId }: { orgId: string; userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    activity_type: 'Running',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    max_participants: '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.event_date || !form.event_time) {
      setError('Please set a date and time.')
      return
    }

    setLoading(true)
    setError('')

    const event_time = new Date(`${form.event_date}T${form.event_time}`).toISOString()

    const result = await createEvent({
      org_id: orgId,
      title: form.title,
      activity_type: form.activity_type,
      description: form.description || undefined,
      event_time,
      location: form.location || undefined,
      max_participants: form.max_participants ? parseInt(form.max_participants) : undefined,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess(true)
    setForm({ title: '', activity_type: 'Running', description: '', event_date: '', event_time: '', location: '', max_participants: '' })
    setLoading(false)
    setTimeout(() => setSuccess(false), 3000)
    router.refresh()
  }

  return (
    <div className="glass-card momentum-shadow rounded-xl p-6 sticky top-24">
      <h3 className="font-[family-name:var(--font-montserrat)] font-semibold text-[#0b1c30] mb-4">
        Post an Event
      </h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-[#0b1c30] mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="e.g. Lunchtime Run"
            required
            className="w-full px-3 py-2 border border-[#e0bfbd] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005db8] transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0b1c30] mb-1">Activity</label>
          <select
            value={form.activity_type}
            onChange={e => set('activity_type', e.target.value)}
            className="w-full px-3 py-2 border border-[#e0bfbd] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005db8] bg-white transition-all"
          >
            {ACTIVITY_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">Date</label>
            <input
              type="date"
              value={form.event_date}
              onChange={e => set('event_date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-3 py-2 border border-[#e0bfbd] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005db8] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">Time</label>
            <input
              type="time"
              value={form.event_time}
              onChange={e => set('event_time', e.target.value)}
              required
              className="w-full px-3 py-2 border border-[#e0bfbd] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005db8] transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0b1c30] mb-1">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={e => set('location', e.target.value)}
            placeholder="e.g. Castlefield Basin"
            className="w-full px-3 py-2 border border-[#e0bfbd] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005db8] transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0b1c30] mb-1">Max spots (optional)</label>
          <input
            type="number"
            value={form.max_participants}
            onChange={e => set('max_participants', e.target.value)}
            placeholder="e.g. 8"
            min={2}
            max={100}
            className="w-full px-3 py-2 border border-[#e0bfbd] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005db8] transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0b1c30] mb-1">Description (optional)</label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Tell people what to expect…"
            rows={2}
            className="w-full px-3 py-2 border border-[#e0bfbd] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005db8] transition-all resize-none"
          />
        </div>

        {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        {success && <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">✓ Event posted!</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 vibrant-gradient-coral text-white text-sm font-semibold rounded-lg hover:brightness-110 transition-all active:scale-95 disabled:opacity-60"
        >
          {loading ? 'Posting…' : 'Post event'}
        </button>
      </form>
    </div>
  )
}
