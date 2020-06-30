import models from '../models'
import * as faker from 'faker'
import { Spending } from '../models/spendings'
import { SaveOptions } from 'sequelize/types'
const { Spendings } = models

export function make(overrides?: Record<string, unknown>): Spending {
  return Spendings.build({
    date: faker.date.recent(),
    description: faker.lorem.sentence(),
    value: faker.random.number({ max: 100000, precision: 100 }),
    fromCash: faker.random.boolean(),
    isTransfer: faker.random.number(100) <= 5,

    ...overrides,
  })
}

export default async function create(
  overrides?: Record<string, unknown>,
  queryOpts?: SaveOptions
): Promise<Spending> {

  const model = make(overrides)
  return model.save(queryOpts)
}
