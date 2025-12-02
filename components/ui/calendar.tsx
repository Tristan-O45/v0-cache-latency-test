'use client'

import * as React from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type Range = { from: Date | null; to: Date | null }

type CalendarProps = {
  className?: string
  buttonVariant?: React.ComponentProps<typeof Button>['variant']
  mode?: 'single' | 'range'
  selected?: Date | Range | null
  onSelect?: (date: Date | Range) => void
  initialMonth?: Date
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

function isSameDate(a?: Date | null, b?: Date | null) {
  if (!a || !b) return false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isInRange(day: Date, range: Range) {
  if (!range.from || !range.to) return false
  const time = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime()
  const from = new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate()).getTime()
  const to = new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate()).getTime()
  return time >= from && time <= to
}

function Calendar({
  className,
  buttonVariant = 'ghost',
  mode = 'single',
  selected = null,
  onSelect,
  initialMonth,
}: CalendarProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    initialMonth ? startOfMonth(initialMonth) : startOfMonth(today),
  )

  const selRange =
    mode === 'range' && selected && typeof selected === 'object'
      ? (selected as Range)
      : { from: null, to: null }

  const selDate = mode === 'single' && selected instanceof Date ? selected : null

  const firstDayOfMonth = startOfMonth(currentMonth)
  const lastDayOfMonth = endOfMonth(currentMonth)

  // Start from the Sunday before the first of month (or the day itself)
  const startDate = new Date(firstDayOfMonth)
  startDate.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay())

  const days: Date[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)
    days.push(d)
  }

  function handlePrev() {
    setCurrentMonth((m) => addMonths(m, -1))
  }

  function handleNext() {
    setCurrentMonth((m) => addMonths(m, 1))
  }

  function handleSelect(day: Date) {
    if (mode === 'single') {
      onSelect?.(day)
      return
    }

    // range selection: if no from set, set from. If from set and to unset, set to (or reset if before from)
    const range = selRange
    if (!range.from || (range.from && range.to)) {
      const next: Range = { from: day, to: null }
      onSelect?.(next)
      return
    }

    // from is set and to is null
    if (range.from && !range.to) {
      if (day < range.from) {
        // new start
        onSelect?.({ from: day, to: range.from })
      } else {
        onSelect?.({ from: range.from, to: day })
      }
    }
  }

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div
      data-slot="calendar"
      className={cn('bg-background p-3 rounded-md', className)}
    >
      <div className="flex items-center justify-between mb-2">
        <Button variant={buttonVariant} size="icon" onClick={handlePrev}>
          <ChevronLeftIcon className="size-4" />
        </Button>
        <div className="text-sm font-medium">
          {currentMonth.toLocaleString('default', { month: 'long' })}{' '}
          {currentMonth.getFullYear()}
        </div>
        <Button variant={buttonVariant} size="icon" onClick={handleNext}>
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 text-[0.8rem] text-muted-foreground gap-y-2">
        {weekdays.map((wd) => (
          <div key={wd} className="text-center font-medium">
            {wd}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mt-2">
        {days.map((day) => {
          const isOutside = day.getMonth() !== currentMonth.getMonth()
          const isToday = isSameDate(day, today)
          const selectedSingle = selDate ? isSameDate(day, selDate) : false
          const rangeStart = selRange.from ? isSameDate(day, selRange.from) : false
          const rangeEnd = selRange.to ? isSameDate(day, selRange.to) : false
          const inRange = isInRange(day, selRange)

          return (
            <div key={day.toISOString()} className="text-center">
              <CalendarDayButton
                day={day}
                isOutside={isOutside}
                isToday={isToday}
                selectedSingle={selectedSingle}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                inRange={inRange}
                onSelect={() => handleSelect(day)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CalendarDayButton({
  day,
  isOutside,
  isToday,
  selectedSingle,
  rangeStart,
  rangeEnd,
  inRange,
  onSelect,
  className,
}: {
  day: Date
  isOutside?: boolean
  isToday?: boolean
  selectedSingle?: boolean
  rangeStart?: boolean
  rangeEnd?: boolean
  inRange?: boolean
  onSelect?: () => void
  className?: string
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onSelect}
      data-day={day.toLocaleDateString()}
      data-selected-single={selectedSingle}
      data-range-start={rangeStart}
      data-range-end={rangeEnd}
      data-range-middle={inRange}
      className={cn(
        'flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal [&>span]:text-xs [&>span]:opacity-70',
        isOutside && 'text-muted-foreground',
        selectedSingle && 'bg-primary text-primary-foreground',
        inRange && !rangeStart && !rangeEnd && 'bg-accent text-accent-foreground',
        (rangeStart || rangeEnd) && 'bg-primary text-primary-foreground rounded-md',
        isToday && 'ring-1 ring-ring rounded-md',
        className,
      )}
    >
      <span className="select-none">{day.getDate()}</span>
    </Button>
  )
}

export { Calendar, CalendarDayButton }
