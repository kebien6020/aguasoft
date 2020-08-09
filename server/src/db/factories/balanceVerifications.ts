import models from '../models'
import * as faker from 'faker'
import { BalanceVerification } from '../models/balanceVerifications'
import { SaveOptions } from 'sequelize/types'
const { BalanceVerifications } = models

export function make(overrides?: Record<string, unknown>): BalanceVerification {
  return BalanceVerifications.build({
    date: faker.date.recent(),
    adjustAmount: faker.random.number({ min: -20000, max: 20000 }),
    amount: faker.random.number(5000000),
    ...overrides,
  })
}

export default async function create(
  overrides?: Record<string, unknown>,
  queryOpts?: SaveOptions
): Promise<BalanceVerification> {

  const model = make(overrides)
  return model.save(queryOpts)
}
