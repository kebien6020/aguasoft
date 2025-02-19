import { addDays, format, isAfter, isBefore, isSameDay, parse, startOfDay } from 'date-fns'

// Get an array with all dates betwen the provided dates. Inclusive
export function enumerateDaysBetweenDates(
  startDate: Date,
  endDate: Date,
): Date[] {

  const dates = []

  const lastDate = startOfDay(endDate)

  for (
    let currDate = startOfDay(startDate);
    isSameDayOrBefore(currDate, lastDate);
    currDate = addDays(currDate, 1))
    dates.push(currDate)

  return dates
}

export const isSameDayOrBefore = (a: Date, b: Date): boolean =>
  isSameDay(a, b) || isBefore(a, b)

export const isSameDayOrAfter = (a: Date, b: Date): boolean =>
  isSameDay(a, b) || isAfter(a, b)

export const parseDateonly = (s: string): Date =>
  parse(s, 'yyyy-MM-dd', new Date)

export const formatDateonly = (d: Date): string =>
  format(d, 'yyyy-MM-dd')
