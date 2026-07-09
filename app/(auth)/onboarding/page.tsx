'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { completeOnboardingAction } from './actions'
import type { Organisation, OpUnit } from '@/lib/types'

export default function OnboardingPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
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

      setEmail(user.email ?? '')
      const domain = user.email?.split('@')[1]
      if (!domain) { setError('Could not determine your email domain.'); setFetching(false); return }

      // Find org by domain
      const { data: orgData } = await supabase
        .from('organisations')
        .select('*')
        .eq('domain', domain)
        .single()

      if (!orgData) {
        setError(`No organisation found for @${domain}. Please contact your admin.`)
        setFetching(false)
        return
      }

      setOrg(orgData as Organisation)

      // Load op units
      const { data: units } = await supabase
        .from('op_units')
        .select('*')
        .eq('org_id', orgData.id)
        .order('name')

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

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center">
        <div className="text-[#584140]">Setting up your account…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold text-[#ae2f34]">Rally</h1>
          <p className="text-[#584140] mt-1">One last step</p>
        </div>

        <div className="glass-card momentum-shadow rounded-xl p-8">
          <h2 className="font-[family-name:var(--font-montserrat)] text-xl font-semibold text-[#0b1c30] mb-2">
            Welcome to Rally
          </h2>

          {org ? (
            <>
              <p className="text-sm text-[#584140] mb-6">
                We found your organisation: <strong>{org.name}</strong>. Now pick your division to join the leaderboard.
              </p>

              <form onSubmit={handleComplete} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0b1c30] mb-1">
                    Your division
                  </label>
                  <select
                    value={selectedOpUnit}
                    onChange={e => setSelectedOpUnit(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-[#e0bfbd] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005db8] bg-white transition-all"
                  >
                    <option value="">Select your division…</option>
                    {opUnits.map(unit => (
                      <option key={unit.id} value={unit.id}>{unit.name}</option>
                    ))}
                  </select>
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !selectedOpUnit}
                  className="w-full py-2.5 vibrant-gradient-coral text-white font-semibold rounded-lg hover:brightness-110 transition-all active:scale-95 disabled:opacity-60"
                >
                  {loading ? 'Joining…' : "Let's go →"}
                </button>
              </form>
            </>
          ) : (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
