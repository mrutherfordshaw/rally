interface Row {
  rank: number
  name: string
  value: string
  subvalue?: string
  highlight?: boolean
}

interface Props {
  title: string
  subtitle: string
  rows: Row[]
}

const medalColours: Record<number, string> = {
  1: 'text-yellow-500',
  2: 'text-gray-400',
  3: 'text-amber-600',
}

const rankBg: Record<number, string> = {
  1: 'bg-yellow-50 border-yellow-200',
  2: 'bg-gray-50 border-gray-200',
  3: 'bg-amber-50 border-amber-200',
}

export default function LeaderboardTable({ title, subtitle, rows }: Props) {
  return (
    <div className="glass-card momentum-shadow rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[#e0bfbd]">
        <h3 className="font-[family-name:var(--font-montserrat)] font-semibold text-[#0b1c30]">{title}</h3>
        <p className="text-xs text-[#584140] mt-0.5">{subtitle}</p>
      </div>

      <div className="divide-y divide-[#eff4ff]">
        {rows.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-[#584140]">
            No data yet — be the first to log your steps!
          </div>
        ) : (
          rows.map(row => (
            <div
              key={`${row.rank}-${row.name}`}
              className={`flex items-center gap-4 px-6 py-3 transition-colors hover:bg-[#eff4ff] ${
                row.highlight ? 'bg-[#eff4ff] border-l-2 border-[#005db8]' : ''
              } ${rankBg[row.rank] ?? ''}`}
            >
              {/* Rank */}
              <span className={`text-sm font-bold w-6 text-center ${medalColours[row.rank] ?? 'text-[#584140]'}`}>
                {row.rank <= 3 ? ['🥇', '🥈', '🥉'][row.rank - 1] : `#${row.rank}`}
              </span>

              {/* Name */}
              <div className="flex-grow min-w-0">
                <p className={`text-sm font-semibold truncate ${row.highlight ? 'text-[#005db8]' : 'text-[#0b1c30]'}`}>
                  {row.name} {row.highlight && '(you)'}
                </p>
                {row.subvalue && (
                  <p className="text-xs text-[#584140] truncate">{row.subvalue}</p>
                )}
              </div>

              {/* Value */}
              <span className="text-sm font-bold text-[#ae2f34] whitespace-nowrap">{row.value}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
