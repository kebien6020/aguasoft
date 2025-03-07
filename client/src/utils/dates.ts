import { addDays, format, isAfter, isBefore, isSameDay, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'

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
  const dates = [] as Date[]

  let currDate = startOfDay(startDate)
  const lastDate = startOfDay(endDate)

  for (; isSameDayOrBefore(currDate, lastDate); currDate = addDays(currDate, 1))
    dates.push(currDate)

  return dates
}

export const formatDateonlyMachine = (date: Date): string =>
  format(date, 'yyyy-MM-dd')

export const formatMachine = (date: Date): string =>
  date.toISOString()

export const formatDateonlyHumanShort = (date: Date): string =>
  format(date, 'dd/MMM/yy', { locale: es })
