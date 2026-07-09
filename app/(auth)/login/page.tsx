'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

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
            Sign in to your account
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
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
                We&apos;ll send a sign-in code to this address.
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 vibrant-gradient-coral text-white font-semibold rounded-lg hover:brightness-110 transition-all active:scale-95 disabled:opacity-60"
            >
              {loading ? 'Sending code…' : 'Send sign-in code'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-[#584140]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#005db8] font-semibold hover:underline">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
