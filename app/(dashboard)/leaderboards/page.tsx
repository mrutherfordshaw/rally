import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getLeaderboardUsers, getLeaderboardOpUnits } from '@/lib/db/leaderboard'
import LeaderboardFull from '@/components/leaderboards/LeaderboardFull'

export default async function LeaderboardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect('/onboarding')

  const [users, opUnits] = await Promise.all([
    getLeaderboardUsers(profile.org_id),
    getLeaderboardOpUnits(profile.org_id),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold text-[#0b1c30]">
          Leaderboards
        </h1>
        <p className="text-[#584140] mt-1">Who&apos;s leading the pack?</p>
      </div>

      <LeaderboardFull
        users={users}
        opUnits={opUnits}
        currentUserId={user.id}
      />
    </div>
  )
}
