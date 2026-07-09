'use client'

import { useState } from 'react'
import { createChallenge } from '@/lib/db/challenges'
import { useRouter } from 'next/navigation'
import type { Challenge } from '@/lib/types'

export default function CreateChallengeForm({
  orgId,
  metricTypeId,
  activeChallenge,
}: {
  orgId: string
  metricTypeId: string
  activeChallenge: Challenge | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (activeChallenge) {
      setError('There is already an active challenge. Complete it before creating a new one.')
      return
    }
    setLoading(true)
    setError('')

    const result = await createChallenge({
      org_id: orgId,
      metric_type_id: metricTypeId,
      name: form.name,
      description: form.description || undefined,
      start_date: form.start_date,
      end_date: form.end_date,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess(true)
    setForm({ name: '', description: '', start_date: new Date().toISOString().split('T')[0], end_date: '' })
    setLoading(false)
    setTimeout(() => setSuccess(false), 3000)
    router.refresh()
  }

  return (
    <div className="glass-card momentum-shadow rounded-xl p-6 sticky top-24">
      <h3 className="font-[family-name:var(--font-montserrat)] font-semibold text-[#0b1c30] mb-1">
        Create Challenge
      </h3>
      <p className="text-xs text-[#584140] mb-4">
        Launch a firm-wide step challenge across all divisions
      </p>

      {activeChallenge && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4 text-xs text-amber-700">
          <strong>Active:</strong> {activeChallenge.name}<br />
          Complete this challenge before creating a new one.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-[#0b1c30] mb-1">Challenge name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Summer Step Sprint"
            required
            disabled={!!activeChallenge}
            className="w-full px-3 py-2 border border-[#e0bfbd] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005db8] transition-all disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0b1c30] mb-1">Description (optional)</label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="What's at stake?"
            rows={2}
            disabled={!!activeChallenge}
            className="w-full px-3 py-2 border border-[#e0bfbd] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005db8] transition-all resize-none disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0b1c30] mb-1">Start date</label>
          <input
            type="date"
            value={form.start_date}
            onChange={e => set('start_date', e.target.value)}
            required
            disabled={!!activeChallenge}
            className="w-full px-3 py-2 border border-[#e0bfbd] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005db8] transition-all disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0b1c30] mb-1">End date</label>
          <input
            type="date"
            value={form.end_date}
            onChange={e => set('end_date', e.target.value)}
            min={form.start_date}
            required
            disabled={!!activeChallenge}
            className="w-full px-3 py-2 border border-[#e0bfbd] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005db8] transition-all disabled:opacity-50"
          />
        </div>

        {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        {success && <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">✓ Challenge created!</p>}

        <button
          type="submit"
          disabled={loading || !!activeChallenge}
          className="w-full py-2.5 vibrant-gradient-coral text-white text-sm font-semibold rounded-lg hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Launch challenge'}
        </button>
      </form>
    </div>
  )
}
