'use client'

import { useState } from 'react'
import { logMetric } from '@/lib/db/metric-logs'
import { useRouter } from 'next/navigation'

interface Props {
  userId: string
  orgId: string
  opUnitId: string | null
  todaySteps: number
  metricTypeId: string
}

export default function StepLogger({ userId, orgId, opUnitId, todaySteps, metricTypeId }: Props) {
  const router = useRouter()
  const [steps, setSteps] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleLog(e: React.FormEvent) {
    e.preventDefault()
    const value = parseInt(steps)
    if (isNaN(value) || value < 1 || value > 100000) {
      setError('Please enter a valid step count between 1 and 100,000.')
      return
    }

    setLoading(true)
    setError('')

    const result = await logMetric({
      metric_type_id: metricTypeId,
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

  const pct = Math.min((todaySteps / 10000) * 100, 100)

  return (
    <div className="card momentum-shadow p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-brand font-bold text-[#0b1c30] text-base">Log Today&apos;s Steps</h3>
          <p className="text-xs text-[#584140] mt-0.5">
            {todaySteps > 0 ? `${todaySteps.toLocaleString()} steps logged today` : 'No steps logged yet today'}
          </p>
        </div>
        {success && (
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            ✓ Saved!
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-[#584140] mb-1.5">
          <span>Daily goal progress</span>
          <span>{Math.round(pct)}% of 10,000</span>
        </div>
        <div className="h-2.5 bg-[#eff4ff] rounded-full overflow-hidden">
          <div
            className="h-full gradient-coral rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleLog} className="flex gap-3 items-start">
        <div className="flex-grow">
          <input
            type="number"
            value={steps}
            onChange={e => setSteps(e.target.value)}
            placeholder="Enter step count, e.g. 8432"
            min={1}
            max={100000}
            className="input-base"
          />
          {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={loading || !steps}
          className="btn-secondary whitespace-nowrap flex-shrink-0"
          style={{width: 'auto', padding: '0.625rem 1.25rem'}}
        >
          {loading ? 'Saving…' : 'Log steps'}
        </button>
      </form>
    </div>
  )
}
