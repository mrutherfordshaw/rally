'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/onboarding')
  }

  return (
    <div className="auth-bg">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 gradient-coral rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-brand font-black text-lg">R</span>
            </div>
            <span className="font-brand font-black text-3xl text-[#0b1c30]">Rally</span>
          </div>
          <p className="text-[#584140] text-sm">Make healthy competition the default.</p>
        </div>

        <div className="card p-8">
          <h2 className="font-brand text-xl font-bold text-[#0b1c30] mb-1">Join Rally</h2>
          <p className="text-sm text-[#584140] mb-7">Create your account and start competing</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1.5 uppercase tracking-wider">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Jamie Smith"
                required
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1.5 uppercase tracking-wider">Work email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@deloitte.co.uk"
                required
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1.5 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                minLength={6}
                className="input-base"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary mt-2">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#eff4ff] text-center text-sm text-[#584140]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#ae2f34] font-semibold hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
