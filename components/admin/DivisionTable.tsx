import type { LeaderboardOpUnit } from '@/lib/types'

const medals = ['🥇', '🥈', '🥉']

export default function DivisionTable({
  opUnits,
  orgId,
}: {
  opUnits: LeaderboardOpUnit[]
  orgId: string
}) {
  return (
    <div className="glass-card momentum-shadow rounded-xl overflow-hidden">
      <div className="px-6 py-4 bg-[#dce9ff] border-b border-[#e0bfbd] flex items-center justify-between">
        <h3 className="font-[family-name:var(--font-montserrat)] font-semibold text-[#0b1c30]">
          Division Leaderboard
        </h3>
        <span className="text-xs text-[#584140]">Ranked by average steps per member</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#eff4ff] border-b border-[#e0bfbd]">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-[#584140] uppercase tracking-wider">Rank</th>
              <th className="px-6 py-3 text-xs font-semibold text-[#584140] uppercase tracking-wider">Division</th>
              <th className="px-6 py-3 text-xs font-semibold text-[#584140] uppercase tracking-wider text-center">Members</th>
              <th className="px-6 py-3 text-xs font-semibold text-[#584140] uppercase tracking-wider text-right">Avg Steps</th>
              <th className="px-6 py-3 text-xs font-semibold text-[#584140] uppercase tracking-wider text-right">Total Steps</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eff4ff]">
            {opUnits.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#584140]">
                  No step data yet — divisions will appear here once members log steps
                </td>
              </tr>
            ) : (
              opUnits.map(unit => (
                <tr key={unit.op_unit_id} className="hover:bg-[#eff4ff] transition-colors">
                  <td className="px-6 py-3 text-sm font-bold text-[#584140]">
                    {unit.rank <= 3 ? medals[unit.rank - 1] : `#${unit.rank}`}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#eff4ff] flex items-center justify-center text-xs font-bold text-[#005db8]">
                        {unit.name.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-[#0b1c30]">{unit.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-center text-[#0b1c30] font-medium">
                    {unit.member_count}
                  </td>
                  <td className="px-6 py-3 text-sm text-right font-bold text-[#ae2f34]">
                    {Math.round(unit.avg_steps_per_member).toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-[#584140]">
                    {unit.total_steps.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
