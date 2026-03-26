import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { MonthColumn } from './MonthColumn'
import { DayModal } from './DayModal'
import { Button } from '@/components/ui/button'
import type { Identity } from '@/hooks/useIdentity'
import { exportMonthPdf } from '@/lib/exportMonthPdf'
import { toast } from 'sonner'

interface CalendarGridProps {
  identity: Identity
  onLogout: () => void
}

export function CalendarGrid({ identity, onLogout }: CalendarGridProps) {
  const [year, setYear] = useState(new Date().getFullYear())
  const [postCounts, setPostCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [exportingMonth, setExportingMonth] = useState<number | null>(null)

  const fetchPostCounts = useCallback(async (y: number) => {
    setLoading(true)
    const startDate = `${y}-01-01`
    const endDate = `${y}-12-31`

    const { data, error } = await supabase
      .from('posts')
      .select('date')
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) {
      console.error('Failed to fetch post counts:', error)
    } else {
      const counts: Record<string, number> = {}
      for (const row of data ?? []) {
        counts[row.date as string] = (counts[row.date as string] ?? 0) + 1
      }
      setPostCounts(counts)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void fetchPostCounts(year)
  }, [year, fetchPostCounts])

  function handleDayClick(date: string) {
    setSelectedDate(date)
  }

  function handleModalClose() {
    setSelectedDate(null)
    // Refresh counts in case a post was added/removed
    void fetchPostCounts(year)
  }

  async function handleExport(y: number, month: number) {
    setExportingMonth(month)
    try {
      await exportMonthPdf(y, month)
    } catch (err) {
      if (err instanceof Error && err.message === 'NO_POSTS') {
        toast.info('No posts to export for this month.')
      } else {
        toast.error('Export failed. Please try again.')
        console.error(err)
      }
    } finally {
      setExportingMonth(null)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-base font-semibold text-stone-900">Family Calendar</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setYear((y) => y - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-stone-700 w-12 text-center">{year}</span>
          <Button variant="ghost" size="icon" onClick={() => setYear((y) => y + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: identity.author_color }}
          />
          <span className="text-sm text-stone-600">{identity.author_name}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            title="Log out"
            className="text-stone-400 hover:text-stone-700"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Loading bar */}
      {loading && (
        <div className="h-0.5 bg-stone-200">
          <div className="h-full bg-stone-700 animate-pulse w-1/2" />
        </div>
      )}

      {/* Calendar grid — horizontal scroll on mobile */}
      <div className="overflow-x-auto">
        <div
          className="grid gap-px bg-stone-100"
          style={{
            gridTemplateColumns: 'repeat(12, minmax(72px, 1fr))',
            minWidth: '864px',
          }}
        >
          {Array.from({ length: 12 }, (_, month) => (
            <div key={month} className="bg-white">
              <MonthColumn
                year={year}
                month={month}
                postCounts={postCounts}
                onDayClick={handleDayClick}
                onExport={handleExport}
                exportLoading={exportingMonth === month}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Day modal */}
      {selectedDate && (
        <DayModal
          date={selectedDate}
          identity={identity}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}
