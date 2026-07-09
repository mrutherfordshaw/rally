import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getLeaderboardOpUnits } from '@/lib/db/leaderboard'
import { getActiveOrgChallenge, getOrgChallenges } from '@/lib/db/challenges'
import OrgStats from '@/components/admin/OrgStats'
import DivisionTable from '@/components/admin/DivisionTable'
import CreateChallengeForm from '@/components/admin/CreateChallengeForm'

export default async function OrgAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organisations(name, domain)')
    .eq('id', user.id)
    .single()

  if (!profile?.org_id) redirect('/onboarding')
  if (!['org_admin', 'app_admin'].includes(profile.role)) redirect('/dashboard')

  const orgName = (profile.organisations as { name: string } | null)?.name ?? 'Your Organisation'

  const [opUnits, activeChallenge, allChallenges, memberCountResult] = await Promise.all([
    getLeaderboardOpUnits(profile.org_id),
    getActiveOrgChallenge(profile.org_id),
    getOrgChallenges(profile.org_id),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('org_id', profile.org_id),
  ])

  const { data: metricType } = await supabase
    .from('metric_types')
    .select('id')
    .eq('slug', 'steps')
    .single()

  const totalSteps = opUnits.reduce((sum, u) => sum + u.total_steps, 0)
  const memberCount = memberCountResult.count ?? 0
  const participationRate = memberCount > 0
    ? Math.round((opUnits.filter(u => u.total_steps > 0).length / opUnits.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold text-[#ae2f34] uppercase tracking-wider">Admin Hub</p>
          <h1 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold text-[#0b1c30]">
            Organisation Overview
          </h1>
          <p className="text-[#584140] mt-1">Real-time engagement across all {opUnits.length} divisions</p>
        </div>
      </div>

      {/* Top stats */}
      <OrgStats
        totalSteps={totalSteps}
        memberCount={memberCount}
        divisionCount={opUnits.length}
        activeChallenge={activeChallenge?.name ?? null}
        participationRate={participationRate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Division table */}
        <div className="lg:col-span-2">
          <DivisionTable opUnits={opUnits} orgId={profile.org_id} />
        </div>

        {/* Create challenge */}
        <div>
          <CreateChallengeForm
            orgId={profile.org_id}
            metricTypeId={metricType?.id ?? ''}
            activeChallenge={activeChallenge}
          />
        </div>
      </div>

      {/* Challenge history */}
      {allChallenges.length > 0 && (
        <div className="glass-card momentum-shadow rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e0bfbd]">
            <h3 className="font-[family-name:var(--font-montserrat)] font-semibold text-[#0b1c30]">Challenge History</h3>
          </div>
          <div className="divide-y divide-[#eff4ff]">
            {allChallenges.map(c => (
              <div key={c.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-semibold text-[#0b1c30]">{c.name}</p>
                  <p className="text-xs text-[#584140]">
                    {new Date(c.start_date).toLocaleDateString('en-GB')} → {new Date(c.end_date).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  c.status === 'active' ? 'bg-green-100 text-green-700' :
                  c.status === 'completed' ? 'bg-[#eff4ff] text-[#005db8]' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
