import models from '../models'
import * as faker from 'faker'
import { Payment } from '../models/payments'
import { SaveOptions } from 'sequelize/types'
import * as moment from 'moment'
const { Payments } = models

export function make(overrides?: Record<string, unknown>): Payment {
  const useDates = faker.random.boolean()
  const fromStart = moment().startOf('month').subtract(2, 'months').toDate()
  const fromEnd = moment().startOf('month').subtract(1, 'months').toDate()
  const dateFrom = useDates ? faker.date.between(fromStart, fromEnd) : null
  const dateTo = dateFrom ? moment(dateFrom).add(5, 'days') : null

  return Payments.build({
    clientId: null, // manual
    userId: null, // manual
    value: faker.random.number({ max: 50000, precision: 100 }),
    date: faker.date.recent(),
    dateFrom,
    dateTo,
    invoiceNo: faker.random.boolean() ? String(faker.random.number()) : null,
    invoiceDate: faker.date.recent(),
    directPayment: faker.random.boolean(),

    ...overrides,
  })
}

export default async function create(
  overrides?: Record<string, unknown>,
  queryOpts?: SaveOptions
): Promise<Payment> {

  const model = make(overrides)
  return model.save(queryOpts)
}
