import faker from 'faker'
import { BalanceVerifications } from '../models.js'
import type { SaveOptions } from 'sequelize'
import { format } from 'date-fns'

type Overrides = Record<string, unknown> & {
  createdById: number
}

export function make(overrides: Overrides): BalanceVerifications {
  return BalanceVerifications.build({
    date: format(faker.date.recent(), 'yyyy-MM-dd'),
    adjustAmount: faker.datatype.number({ min: -20000, max: 20000 }),
    amount: faker.datatype.number(5000000),
    ...overrides,
  })
}

export default async function create(
  overrides: Overrides,
  queryOpts?: SaveOptions,
): Promise<BalanceVerifications> {

  const model = make(overrides)
  return model.save(queryOpts)
}
