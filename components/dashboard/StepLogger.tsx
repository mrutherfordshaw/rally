'use client'

import { useState } from 'react'
import { logMetric } from '@/lib/db/metric-logs'
import { useRouter } from 'next/navigation'

interface Props {
  userId: string
  orgId: string
  opUnitId: string | null
  todaySteps: number
}

export default function StepLogger({ userId, orgId, opUnitId, todaySteps }: Props) {
  const router = useRouter()
  const [steps, setSteps] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleLog(e: React.FormEvent) {
    e.preventDefault()
    const value = parseInt(steps)
    if (!value || value < 0 || value > 100000) {
      setError('Please enter a valid step count (0–100,000).')
      return
    }

    setLoading(true)
    setError('')

    // Get steps metric type id
    const result = await logMetric({
      metric_type_id: await getStepsMetricTypeId(),
      date: new Date().toISOString().split('T')[0],
      value,
      source: 'manual',
      org_id: orgId,
      op_unit_id: opUnitId,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setSuccess(true)
    setSteps('')
    setLoading(false)
    setTimeout(() => setSuccess(false), 3000)
    router.refresh()
  }

  return (
    <div className="glass-card momentum-shadow rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-[family-name:var(--font-montserrat)] font-semibold text-[#0b1c30]">
            Log Today&apos;s Steps
          </h3>
          {todaySteps > 0 && (
            <p className="text-xs text-[#584140] mt-0.5">
              Current: {todaySteps.toLocaleString()} steps — logging will replace this value
            </p>
          )}
        </div>
        {success && (
          <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
            ✓ Logged!
          </span>
        )}
      </div>

      <form onSubmit={handleLog} className="flex gap-3 items-start">
        <div className="flex-grow">
          <input
            type="number"
            value={steps}
            onChange={e => setSteps(e.target.value)}
            placeholder="e.g. 8,432"
            min={0}
            max={100000}
            className="w-full px-4 py-2.5 border border-[#e0bfbd] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005db8] transition-all"
          />
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={loading || !steps}
          className="px-6 py-2.5 vibrant-gradient-coral text-white text-sm font-semibold rounded-lg hover:brightness-110 transition-all active:scale-95 disabled:opacity-60 whitespace-nowrap"
        >
          {loading ? 'Saving…' : 'Log steps'}
        </button>
      </form>
    </div>
  )
}

// Fetches steps metric type id from Supabase
async function getStepsMetricTypeId(): Promise<string> {
  const { createClient } = await import('@/lib/supabase/client')
  const supabase = createClient()
  const { data } = await supabase
    .from('metric_types')
    .select('id')
    .eq('slug', 'steps')
    .single()
  return data?.id ?? ''
}
