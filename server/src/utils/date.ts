import * as moment from 'moment'
import { Moment, MomentInput } from 'moment'

// Get an array with all dates betwen the provided dates. Inclusive
export function enumerateDaysBetweenDates(
  startDate: MomentInput,
  endDate: MomentInput
): Moment[] {

  const dates = []

  const currDate = moment(startDate).startOf('day')
  const lastDate = moment(endDate).startOf('day')

  for (;currDate.isSameOrBefore(lastDate, 'day'); currDate.add(1, 'day'))
    dates.push(currDate.clone())

  return dates
}
