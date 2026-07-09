import type { Challenge } from '@/lib/types'

export default function ChallengeBanner({ challenge }: { challenge: Challenge }) {
  const end = new Date(challenge.end_date)
  const now = new Date()
  const daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

  return (
    <div className="vibrant-gradient-coral rounded-xl p-5 text-white momentum-shadow">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Active Challenge</p>
          <h3 className="font-[family-name:var(--font-montserrat)] text-xl font-bold mt-1">
            {challenge.name}
          </h3>
          {challenge.description && (
            <p className="text-sm opacity-90 mt-1">{challenge.description}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold font-[family-name:var(--font-montserrat)]">{daysLeft}</p>
          <p className="text-xs opacity-80">{daysLeft === 1 ? 'day' : 'days'} remaining</p>
        </div>
      </div>
    </div>
  )
}
