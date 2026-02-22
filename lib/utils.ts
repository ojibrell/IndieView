import { format, isThisWeek, isPast, startOfDay, nextFriday, nextSunday, isFriday, isSaturday, isSunday } from 'date-fns'

export function formatEventDate(dateString: string): string {
  const date = new Date(dateString)
  return format(date, "EEE, MMM d · h:mm a")
}

export function formatEventDateFull(dateString: string): string {
  const date = new Date(dateString)
  return format(date, "EEEE, MMMM d, yyyy 'at' h:mm a")
}

export function isEventPast(dateString: string): boolean {
  return isPast(new Date(dateString))
}

export function isEventThisWeekend(dateString: string): boolean {
  const date = new Date(dateString)
  return isThisWeek(date, { weekStartsOn: 1 }) && (isFriday(date) || isSaturday(date) || isSunday(date))
}

export function getWeekendRange(): { friday: string; sunday: string } {
  const now = new Date()
  let fri: Date
  let sun: Date

  if (isFriday(now) || isSaturday(now) || isSunday(now)) {
    // We're already in the weekend
    if (isFriday(now)) {
      fri = startOfDay(now)
      sun = nextSunday(now)
    } else if (isSaturday(now)) {
      fri = startOfDay(new Date(now.getTime() - 24 * 60 * 60 * 1000))
      sun = nextSunday(now)
    } else {
      // Sunday
      fri = startOfDay(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000))
      sun = startOfDay(now)
    }
  } else {
    fri = nextFriday(now)
    sun = nextSunday(fri)
  }

  sun.setHours(23, 59, 59, 999)

  return {
    friday: fri.toISOString(),
    sunday: sun.toISOString(),
  }
}

export function getSeatsRemaining(maxCapacity: number, currentAttendees: number): number {
  return Math.max(0, maxCapacity - currentAttendees)
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
