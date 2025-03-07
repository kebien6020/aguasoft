import { faker } from '@faker-js/faker'
import { Payments } from '../models.js'
import type { SaveOptions } from 'sequelize'
import { addDays, addMonths, startOfMonth } from 'date-fns'

type Overrides = Record<string, unknown> & {
  clientId: number
  userId: number
  dateFrom?: Date
  dateTo?: Date
}

export function make(overrides: Overrides): Payments {
  const { dateFrom: dfOverride, dateTo: dtOverride } = overrides

  const coinFlip = faker.datatype.boolean()
  const fromStart = addMonths(startOfMonth(new Date), -2)
  const fromEnd = addMonths(startOfMonth(new Date), -1)
  const dateFrom = coinFlip && dfOverride
    ? dfOverride
    : faker.date.between({ from: fromStart, to: fromEnd })
  const dateTo = coinFlip && dtOverride ? dtOverride : addDays(dateFrom, 5)

  return Payments.build({
    value: String(faker.number.int({ max: 50000, multipleOf: 100 })),
    date: faker.date.recent(),
    dateFrom,
    dateTo,
    invoiceNo: faker.datatype.boolean() ? String(faker.number.int()) : '',
    invoiceDate: faker.date.recent(),
    directPayment: faker.datatype.boolean(),

    ...overrides,
  })
}

export default async function create(
  overrides: Overrides,
  queryOpts?: SaveOptions,
): Promise<Payments> {

  const model = make(overrides)
  return model.save(queryOpts)
}
