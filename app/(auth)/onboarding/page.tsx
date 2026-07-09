'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { completeOnboardingAction } from './actions'
import type { Organisation, OpUnit } from '@/lib/types'

export default function OnboardingPage() {
  const router = useRouter()
  const [org, setOrg] = useState<Organisation | null>(null)
  const [opUnits, setOpUnits] = useState<OpUnit[]>([])
  const [selectedOpUnit, setSelectedOpUnit] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    async function loadOrgData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const domain = user.email?.split('@')[1]
      if (!domain) { setError('Could not determine your email domain.'); setFetching(false); return }

      const { data: orgData } = await supabase.from('organisations').select('*').eq('domain', domain).single()
      if (!orgData) { setError(`No organisation found for @${domain}. Please contact your admin.`); setFetching(false); return }

      setOrg(orgData as Organisation)
      const { data: units } = await supabase.from('op_units').select('*').eq('org_id', orgData.id).order('name')
      setOpUnits((units as OpUnit[]) ?? [])
      setFetching(false)
    }
    loadOrgData()
  }, [router])

  async function handleComplete(e: React.FormEvent) {
    e.preventDefault()
    if (!org || !selectedOpUnit) return
    setLoading(true)
    setError('')
    const result = await completeOnboardingAction(org.id, selectedOpUnit)
    if (result.error) { setError(result.error); setLoading(false); return }
    router.push('/dashboard')
  }

  if (fetching) {
    return (
      <div className="auth-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#ae2f34] border-t-transparent animate-spin" />
          <p className="text-[#584140] text-sm">Setting up your account…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-bg">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 gradient-coral rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-brand font-black text-lg">R</span>
            </div>
            <span className="font-brand font-black text-3xl text-[#0b1c30]">Rally</span>
          </div>
          <p className="text-[#584140] text-sm">One last step</p>
        </div>

        <div className="card p-8">
          <div className="w-12 h-12 gradient-coral rounded-xl flex items-center justify-center mb-5 shadow">
            <span className="text-2xl">🏆</span>
          </div>
          <h2 className="font-brand text-xl font-bold text-[#0b1c30] mb-1">Choose your division</h2>

          {org ? (
            <>
              <p className="text-sm text-[#584140] mb-7">
                You&apos;re joining <strong className="text-[#0b1c30]">{org.name}</strong>. Pick your division to start competing on the leaderboard.
              </p>

              <form onSubmit={handleComplete} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0b1c30] mb-1.5 uppercase tracking-wider">Your division</label>
                  <select
                    value={selectedOpUnit}
                    onChange={e => setSelectedOpUnit(e.target.value)}
                    required
                    className="input-base"
                  >
                    <option value="">Select your division…</option>
                    {opUnits.map(unit => (
                      <option key={unit.id} value={unit.id}>{unit.name}</option>
                    ))}
                  </select>
                </div>

                {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>}

                <button type="submit" disabled={loading || !selectedOpUnit} className="btn-primary mt-2">
                  {loading ? 'Joining…' : "Let's go →"}
                </button>
              </form>
            </>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mt-4">{error}</div>
          )}
        </div>
      </div>
    </div>
  )
}
