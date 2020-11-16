import { addDays, isAfter, isBefore, isSameDay, startOfDay } from 'date-fns'

export const isSameDayOrBefore = (a: Date, b: Date): boolean =>
  isSameDay(a, b)
  || isBefore(a, b)

export const isSameDayOrAfter = (a: Date, b: Date): boolean =>
  isSameDay(a, b)
  || isAfter(a, b)

/**
 * Get an array with all dates betwen the provided dates. Inclusive
 */
export const enumerateDaysBetweenDates = (startDate: Date, endDate: Date): Date[] => {
  const dates = []

  let currDate = startOfDay(startDate)
  const lastDate = startOfDay(endDate)

  for (;isSameDayOrBefore(currDate, lastDate); currDate = addDays(currDate, 1))
    dates.push(currDate)

  return dates
}
