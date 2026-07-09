interface Props {
  totalSteps: number
  memberCount: number
  divisionCount: number
  activeChallenge: string | null
  participationRate: number
}

export default function OrgStats({ totalSteps, memberCount, divisionCount, activeChallenge, participationRate }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="glass-card momentum-shadow rounded-xl p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-6xl select-none">
          👣
        </div>
        <p className="text-xs font-semibold text-[#584140] uppercase tracking-wider">Total Steps</p>
        <p className="font-[family-name:var(--font-montserrat)] text-3xl font-bold text-[#ae2f34] mt-2">
          {totalSteps.toLocaleString()}
        </p>
        <div className="mt-3 h-1.5 bg-[#e5eeff] rounded-full overflow-hidden">
          <div className="h-full vibrant-gradient-coral w-3/4 rounded-full" />
        </div>
      </div>

      <div className="glass-card momentum-shadow rounded-xl p-5">
        <p className="text-xs font-semibold text-[#584140] uppercase tracking-wider">Active Members</p>
        <p className="font-[family-name:var(--font-montserrat)] text-3xl font-bold text-[#005db8] mt-2">
          {memberCount.toLocaleString()}
        </p>
        <p className="text-xs text-[#584140] mt-3">across {divisionCount} divisions</p>
      </div>

      <div className="glass-card momentum-shadow rounded-xl p-5">
        <p className="text-xs font-semibold text-[#584140] uppercase tracking-wider">Active Challenge</p>
        <p className="font-[family-name:var(--font-montserrat)] text-lg font-bold text-[#0b1c30] mt-2 leading-tight">
          {activeChallenge ?? 'None'}
        </p>
        {!activeChallenge && (
          <p className="text-xs text-[#584140] mt-2">Create one to start competing →</p>
        )}
      </div>

      <div className="glass-card momentum-shadow rounded-xl p-5">
        <p className="text-xs font-semibold text-[#584140] uppercase tracking-wider">Participation Rate</p>
        <p className="font-[family-name:var(--font-montserrat)] text-3xl font-bold text-[#0b1c30] mt-2">
          {participationRate}%
        </p>
        <div className="mt-3 h-1.5 bg-[#e5eeff] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00687a] rounded-full transition-all duration-700"
            style={{ width: `${participationRate}%` }}
          />
        </div>
      </div>
    </div>
  )
}
