import { enumerateDaysBetweenDates } from './date.js'
import { test } from 'node:test'
import { deepEqual } from 'node:assert'

test('basic case', () => {
  const startDate = new Date('2021-01-01T00:00:00-05:00')
  const endDate = new Date('2021-01-03T00:00:00-05:00')
  const result = enumerateDaysBetweenDates(startDate, endDate)
  deepEqual(result, [
    new Date('2021-01-01T00:00:00-05:00'),
    new Date('2021-01-02T00:00:00-05:00'),
    new Date('2021-01-03T00:00:00-05:00'),
  ])
})

test('same date', () => {
  const startDate = new Date('2021-01-01T00:00:00-05:00')
  const endDate = new Date('2021-01-01T00:00:00-05:00')
  const result = enumerateDaysBetweenDates(startDate, endDate)
  deepEqual(result, [new Date('2021-01-01T00:00:00-05:00')])
})
