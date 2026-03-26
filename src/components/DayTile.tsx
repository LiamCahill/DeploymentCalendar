import { cn } from '@/lib/utils'

interface DayTileProps {
  day: number
  date: string // ISO date string "YYYY-MM-DD"
  postCount: number
  onClick: (date: string) => void
}

export function DayTile({ day, date, postCount, onClick }: DayTileProps) {
  const today = new Date().toISOString().slice(0, 10)
  const isToday = date === today
  const hasPosts = postCount > 0

  return (
    <button
      onClick={() => onClick(date)}
      className={cn(
        'w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 group relative',
        isToday && 'bg-stone-100 font-semibold'
      )}
    >
      <span className={cn('text-stone-700', isToday && 'text-stone-900')}>
        {day}
      </span>
      {hasPosts && (
        <span
          className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-stone-800 text-white text-[9px] font-medium"
          aria-label={`${postCount} post${postCount > 1 ? 's' : ''}`}
        >
          {postCount > 9 ? '9+' : postCount}
        </span>
      )}
    </button>
  )
}
