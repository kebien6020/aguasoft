import models from '../models'
import * as faker from 'faker'
import { Sell } from '../models/sells'
import { SaveOptions } from 'sequelize/types'
const { Sells } = models

export function make(overrides?: Record<string, unknown>): Sell {
  return Sells.build({
    userId: null, // manual
    clientId: null, // manual
    productId: null, // manual
    date: faker.date.recent(),
    cash: faker.random.boolean(),
    priceOverride: null,
    quantity: faker.random.number(10),
    value: faker.random.number({ max: 20000, precision: 100 }),
    deleted: false,

    ...overrides,
  })
}

export default async function create(
  overrides?: Record<string, unknown>,
  queryOpts?: SaveOptions
): Promise<Sell> {

  const model = make(overrides)
  return model.save(queryOpts)
}
