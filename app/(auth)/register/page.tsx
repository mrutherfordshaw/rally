'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
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

    const res = await fetch('/api/auth/send-magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, fullName }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    setSent(true)
    setCooldown(60)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold text-[#ae2f34]">Rally</h1>
          </div>
          <div className="glass-card momentum-shadow rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="font-[family-name:var(--font-montserrat)] text-xl font-semibold text-[#0b1c30] mb-2">
              Check your inbox
            </h2>
            <p className="text-sm text-[#584140] mb-6">
              We sent a sign-in link to <strong>{email}</strong>. Click it to continue — check your spam folder if it doesn&apos;t arrive.
            </p>
            <button
              onClick={() => { setSent(false); setCooldown(0) }}
              disabled={cooldown > 0}
              className="text-sm text-[#005db8] font-semibold hover:underline disabled:opacity-50"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend link'}
            </button>
          </div>
        </div>
      </div>
    )
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
              <label className="block text-sm font-semibold text-[#0b1c30] mb-1">Full name</label>
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
              <label className="block text-sm font-semibold text-[#0b1c30] mb-1">Work email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@deloitte.co.uk"
                required
                className="w-full px-4 py-2.5 border border-[#e0bfbd] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#005db8] focus:border-transparent transition-all"
              />
              <p className="text-xs text-[#584140] mt-1">We&apos;ll send a sign-in link to this address.</p>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="w-full py-2.5 vibrant-gradient-coral text-white font-semibold rounded-lg hover:brightness-110 transition-all active:scale-95 disabled:opacity-60"
            >
              {loading ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Send sign-in link'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-[#584140]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#005db8] font-semibold hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
