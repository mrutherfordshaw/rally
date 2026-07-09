'use client'

import { useState } from 'react'
import type { LeaderboardUser, LeaderboardOpUnit } from '@/lib/types'

const medals = ['🥇', '🥈', '🥉']

export default function LeaderboardFull({
  users,
  opUnits,
  currentUserId,
}: {
  users: LeaderboardUser[]
  opUnits: LeaderboardOpUnit[]
  currentUserId: string
}) {
  const [tab, setTab] = useState<'divisions' | 'individuals'>('divisions')

  return (
    <div className="glass-card momentum-shadow rounded-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-[#e0bfbd]">
        {(['divisions', 'individuals'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors capitalize ${
              tab === t
                ? 'text-[#ae2f34] border-b-2 border-[#ae2f34] bg-white'
                : 'text-[#584140] hover:text-[#0b1c30]'
            }`}
          >
            {t === 'divisions' ? 'Division Leaderboard' : 'Individual Leaderboard'}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      {tab === 'divisions' && opUnits.length >= 3 && (
        <div className="bg-gradient-to-b from-[#eff4ff] to-white px-6 py-6">
          <div className="flex items-end justify-center gap-4">
            {/* 2nd */}
            <PodiumCard item={opUnits[1]} position={2} label={`${Math.round(opUnits[1].avg_steps_per_member).toLocaleString()} avg`} />
            {/* 1st */}
            <PodiumCard item={opUnits[0]} position={1} label={`${Math.round(opUnits[0].avg_steps_per_member).toLocaleString()} avg`} large />
            {/* 3rd */}
            {opUnits[2] && <PodiumCard item={opUnits[2]} position={3} label={`${Math.round(opUnits[2].avg_steps_per_member).toLocaleString()} avg`} />}
          </div>
        </div>
      )}

      {tab === 'individuals' && users.length >= 3 && (
        <div className="bg-gradient-to-b from-[#eff4ff] to-white px-6 py-6">
          <div className="flex items-end justify-center gap-4">
            <PodiumCard item={users[1]} position={2} label={`${users[1].total_steps.toLocaleString()} steps`} highlight={users[1].user_id === currentUserId} />
            <PodiumCard item={users[0]} position={1} label={`${users[0].total_steps.toLocaleString()} steps`} large highlight={users[0].user_id === currentUserId} />
            {users[2] && <PodiumCard item={users[2]} position={3} label={`${users[2].total_steps.toLocaleString()} steps`} highlight={users[2].user_id === currentUserId} />}
          </div>
        </div>
      )}

      {/* Full list */}
      <div className="divide-y divide-[#eff4ff]">
        {tab === 'divisions' && opUnits.map(unit => (
          <div key={unit.op_unit_id} className="flex items-center gap-4 px-6 py-3 hover:bg-[#eff4ff] transition-colors">
            <span className="text-sm font-bold w-8 text-center text-[#584140]">
              {unit.rank <= 3 ? medals[unit.rank - 1] : `#${unit.rank}`}
            </span>
            <div className="flex-grow">
              <p className="text-sm font-semibold text-[#0b1c30]">{unit.name}</p>
              <p className="text-xs text-[#584140]">{unit.member_count} members · {unit.total_steps.toLocaleString()} total steps</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[#ae2f34]">{Math.round(unit.avg_steps_per_member).toLocaleString()}</p>
              <p className="text-xs text-[#584140]">avg / member</p>
            </div>
          </div>
        ))}

        {tab === 'individuals' && users.map(u => (
          <div
            key={u.user_id}
            className={`flex items-center gap-4 px-6 py-3 hover:bg-[#eff4ff] transition-colors ${
              u.user_id === currentUserId ? 'bg-[#eff4ff] border-l-2 border-[#005db8]' : ''
            }`}
          >
            <span className="text-sm font-bold w-8 text-center text-[#584140]">
              {u.rank <= 3 ? medals[u.rank - 1] : `#${u.rank}`}
            </span>
            <div className="flex-grow">
              <p className="text-sm font-semibold text-[#0b1c30]">
                {u.full_name ?? 'Anonymous'} {u.user_id === currentUserId && <span className="text-[#005db8]">(you)</span>}
              </p>
              <p className="text-xs text-[#584140]">{u.op_unit_name ?? 'No division'}</p>
            </div>
            <p className="text-sm font-bold text-[#ae2f34]">{u.total_steps.toLocaleString()}</p>
          </div>
        ))}

        {((tab === 'divisions' && opUnits.length === 0) || (tab === 'individuals' && users.length === 0)) && (
          <div className="px-6 py-10 text-center text-sm text-[#584140]">
            No data yet — log some steps to get on the board!
          </div>
        )}
      </div>
    </div>
  )
}

function PodiumCard({
  item,
  position,
  label,
  large = false,
  highlight = false,
}: {
  item: { name?: string; full_name?: string | null }
  position: number
  label: string
  large?: boolean
  highlight?: boolean
}) {
  const name = (item as { name?: string }).name ?? (item as { full_name?: string | null }).full_name ?? 'Unknown'
  const heights = { 1: 'h-24', 2: 'h-16', 3: 'h-12' }
  const colours = { 1: 'bg-yellow-100 border-yellow-300', 2: 'bg-gray-100 border-gray-300', 3: 'bg-amber-100 border-amber-300' }

  return (
    <div className={`flex flex-col items-center gap-1 ${large ? 'scale-110' : ''}`}>
      <p className="text-2xl">{medals[position - 1]}</p>
      <p className={`text-xs font-semibold text-[#0b1c30] text-center max-w-[80px] truncate ${highlight ? 'text-[#005db8]' : ''}`}>
        {name}
      </p>
      <p className="text-xs text-[#584140] text-center">{label}</p>
      <div className={`w-16 ${heights[position as 1|2|3]} ${colours[position as 1|2|3]} border rounded-t-lg`} />
    </div>
  )
}
