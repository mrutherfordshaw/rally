'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (cooldown > 0) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setCooldown(60)
    setLoading(false)
    sessionStorage.setItem('rally_verify_email', email)
    router.push('/verify')
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold text-[#ae2f34]">
            Rally
          </h1>
          <p className="text-[#584140] mt-1">Make healthy competition the default.</p>
        </div>

        <div className="glass-card momentum-shadow rounded-xl p-8">
          <h2 className="font-[family-name:var(--font-montserrat)] text-xl font-semibold text-[#0b1c30] mb-6">
            Create your account
          </h2>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0b1c30] mb-1">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Jamie Smith"
                required
                className="w-full px-4 py-2.5 border border-[#e0bfbd] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005db8] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0b1c30] mb-1">
                Work email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@deloitte.co.uk"
                required
                className="w-full px-4 py-2.5 border border-[#e0bfbd] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005db8] focus:border-transparent transition-all"
              />
              <p className="text-xs text-[#584140] mt-1">
                You&apos;ll receive a verification code at this address.
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="w-full py-2.5 vibrant-gradient-coral text-white font-semibold rounded-lg hover:brightness-110 transition-all active:scale-95 disabled:opacity-60"
            >
              {loading ? 'Sending code…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Send verification code'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-[#584140]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#005db8] font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
