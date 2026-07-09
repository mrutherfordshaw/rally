'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/types'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/events', label: 'Events' },
  { href: '/leaderboards', label: 'Leaderboards' },
]

export default function TopNav({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e0bfbd] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="font-[family-name:var(--font-montserrat)] text-xl font-bold text-[#ae2f34]">
            Rally
          </span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition-colors pb-1 ${
                pathname === link.href
                  ? 'text-[#ae2f34] border-b-2 border-[#ae2f34]'
                  : 'text-[#584140] hover:text-[#ae2f34]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-[#0b1c30]">{profile?.full_name ?? 'User'}</p>
            <p className="text-xs text-[#584140] capitalize">{profile?.role?.replace('_', ' ')}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs text-[#584140] hover:text-[#ae2f34] transition-colors font-medium"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
