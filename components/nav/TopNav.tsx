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

const adminRoles = ['org_admin', 'app_admin']

export default function TopNav({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const isAdmin = profile?.role && adminRoles.includes(profile.role)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#e8ecf8]" style={{boxShadow: '0 1px 12px rgba(11,28,48,0.06)'}}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 gradient-coral rounded-lg flex items-center justify-center shadow">
            <span className="text-white font-brand font-black text-sm">R</span>
          </div>
          <span className="font-brand font-black text-xl text-[#0b1c30] hidden sm:block">Rally</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navLinks.map(link => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  active ? 'bg-[#eff4ff] text-[#ae2f34]' : 'text-[#584140] hover:bg-[#f5f7ff] hover:text-[#0b1c30]'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
          {isAdmin && (
            <Link
              href="/admin/org"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                pathname.startsWith('/admin') ? 'bg-[#eff4ff] text-[#ae2f34]' : 'text-[#584140] hover:bg-[#f5f7ff] hover:text-[#0b1c30]'
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden md:flex items-center gap-2.5">
            <div className="w-8 h-8 gradient-coral rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0b1c30] leading-tight">{profile?.full_name ?? 'User'}</p>
              <p className="text-xs text-[#584140] capitalize leading-tight">{profile?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs text-[#584140] hover:text-[#ae2f34] font-semibold bg-[#f5f7ff] hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-t border-[#e8ecf8] flex">
        {navLinks.map(link => {
          const active = pathname === link.href
          return (
            <Link key={link.href} href={link.href}
              className={`flex-1 text-center py-2.5 text-xs font-semibold transition-all ${active ? 'text-[#ae2f34] border-b-2 border-[#ae2f34]' : 'text-[#584140]'}`}>
              {link.label}
            </Link>
          )
        })}
        {isAdmin && (
          <Link href="/admin/org"
            className={`flex-1 text-center py-2.5 text-xs font-semibold ${pathname.startsWith('/admin') ? 'text-[#ae2f34] border-b-2 border-[#ae2f34]' : 'text-[#584140]'}`}>
            Admin
          </Link>
        )}
      </div>
    </header>
  )
}
