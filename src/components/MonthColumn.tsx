import { Download } from 'lucide-react'
import { DayTile } from './DayTile'
import { Button } from '@/components/ui/button'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface MonthColumnProps {
  year: number
  month: number // 0-indexed
  postCounts: Record<string, number> // keyed by "YYYY-MM-DD"
  onDayClick: (date: string) => void
  onExport: (year: number, month: number) => void
  exportLoading: boolean
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function MonthColumn({
  year,
  month,
  postCounts,
  onDayClick,
  onExport,
  exportLoading,
}: MonthColumnProps) {
  const daysInMonth = getDaysInMonth(year, month)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="flex flex-col min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-2 mb-1 sticky top-0 bg-white z-10 border-b border-stone-100">
        <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
          {MONTH_NAMES[month]}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onExport(year, month)}
          disabled={exportLoading}
          title={`Export ${MONTH_NAMES[month]} as PDF`}
          className="h-6 w-6 text-stone-400 hover:text-stone-700"
        >
          {exportLoading ? (
            <span className="w-3 h-3 rounded-full border border-stone-400 border-t-stone-700 animate-spin" />
          ) : (
            <Download className="w-3 h-3" />
          )}
        </Button>
      </div>

      {/* Day tiles */}
      <div className="flex flex-col gap-px">
        {days.map((day) => {
          const dateStr = toDateString(year, month, day)
          return (
            <DayTile
              key={day}
              day={day}
              date={dateStr}
              postCount={postCounts[dateStr] ?? 0}
              onClick={onDayClick}
            />
          )
        })}
      </div>
    </div>
  )
}
