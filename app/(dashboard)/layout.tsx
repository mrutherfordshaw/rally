import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TopNav from '@/components/nav/TopNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile && !profile.onboarded) redirect('/onboarding')

  return (
    <div className="min-h-screen flex flex-col" style={{background: 'linear-gradient(135deg, #f5f7ff 0%, #eff4ff 50%, #e8f0ff 100%)'}}>
      <TopNav profile={profile} />
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
