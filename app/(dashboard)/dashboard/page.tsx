import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTodaySteps, getWeekSteps } from '@/lib/db/metric-logs'
import { getLeaderboardUsers, getLeaderboardOpUnits, getUserRank } from '@/lib/db/leaderboard'
import { getActiveOrgChallenge } from '@/lib/db/challenges'
import { getUpcomingEvents } from '@/lib/db/events'
import StepLogger from '@/components/dashboard/StepLogger'
import LeaderboardTable from '@/components/dashboard/LeaderboardTable'
import ChallengeBanner from '@/components/dashboard/ChallengeBanner'
import EventsFeed from '@/components/dashboard/EventsFeed'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, op_units(name), organisations(name)')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect('/onboarding')

  const { data: stepsMetricType } = await supabase
    .from('metric_types')
    .select('id')
    .eq('slug', 'steps')
    .single()

  const [
    todaySteps,
    weekSteps,
    userRank,
    leaderboardUsers,
    leaderboardOpUnits,
    activeChallenge,
    events,
  ] = await Promise.all([
    getTodaySteps(user.id),
    getWeekSteps(user.id),
    getUserRank(user.id, profile.org_id),
    getLeaderboardUsers(profile.org_id),
    getLeaderboardOpUnits(profile.org_id),
    getActiveOrgChallenge(profile.org_id),
    getUpcomingEvents(profile.org_id),
  ])

  const opUnitName = (profile.op_units as { name: string } | null)?.name ?? 'Your Division'
  const orgName = (profile.organisations as { name: string } | null)?.name ?? 'Your Organisation'

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="font-brand text-3xl font-black text-[#0b1c30]">
          Good {getGreeting()}, {profile.full_name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="text-[#584140] mt-1 text-sm">{opUnitName} · {orgName}</p>
      </div>

      {/* Active challenge banner */}
      {activeChallenge && <ChallengeBanner challenge={activeChallenge} />}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card momentum-shadow p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 gradient-coral opacity-5 rounded-full translate-x-8 -translate-y-8" />
          <p className="text-xs font-bold text-[#584140] uppercase tracking-widest">Today&apos;s Steps</p>
          <p className="font-brand text-4xl font-black text-[#ae2f34] mt-2">
            {todaySteps.toLocaleString()}
          </p>
          <div className="mt-3 h-2 bg-[#e5eeff] rounded-full overflow-hidden">
            <div className="h-full gradient-coral rounded-full transition-all duration-700"
              style={{ width: `${Math.min((todaySteps / 10000) * 100, 100)}%` }} />
          </div>
          <p className="text-xs text-[#584140] mt-1.5">{Math.round((todaySteps / 10000) * 100)}% of 10,000 goal</p>
        </div>

        <div className="card momentum-shadow p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 gradient-blue opacity-5 rounded-full translate-x-8 -translate-y-8" />
          <p className="text-xs font-bold text-[#584140] uppercase tracking-widest">This Week</p>
          <p className="font-brand text-4xl font-black text-[#005db8] mt-2">
            {weekSteps.toLocaleString()}
          </p>
          <p className="text-xs text-[#584140] mt-4">Last 7 days total</p>
        </div>

        <div className="card momentum-shadow p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 gradient-teal opacity-5 rounded-full translate-x-8 -translate-y-8" />
          <p className="text-xs font-bold text-[#584140] uppercase tracking-widest">Your Rank</p>
          <p className="font-brand text-4xl font-black text-[#0b1c30] mt-2">
            {userRank ? `#${userRank}` : '—'}
          </p>
          <p className="text-xs text-[#584140] mt-4">Organisation leaderboard</p>
        </div>
      </div>

      {/* Step logger */}
      <StepLogger
        userId={user.id}
        orgId={profile.org_id}
        opUnitId={profile.op_unit_id}
        todaySteps={todaySteps}
        metricTypeId={stepsMetricType?.id ?? ''}
      />

      {/* Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeaderboardTable
          title="Division Leaderboard"
          subtitle="Average steps per member"
          rows={leaderboardOpUnits.map(u => ({
            rank: u.rank,
            name: u.name,
            value: Math.round(u.avg_steps_per_member).toLocaleString(),
            subvalue: `${u.member_count} members`,
          }))}
        />
        <LeaderboardTable
          title="Individual Leaderboard"
          subtitle="Total steps"
          rows={leaderboardUsers.slice(0, 10).map(u => ({
            rank: u.rank,
            name: u.full_name ?? 'Anonymous',
            value: u.total_steps.toLocaleString(),
            subvalue: u.op_unit_name ?? '',
            highlight: u.user_id === user.id,
          }))}
        />
      </div>

      {/* Events */}
      {events.length > 0 && <EventsFeed events={events} userId={user.id} />}
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
