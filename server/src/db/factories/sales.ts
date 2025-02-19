import faker from 'faker'
import { Sells } from '../models.js'
import type { SaveOptions } from 'sequelize'

type Overrides = Record<string, unknown> & {
  userId: number
  clientId: number
  productId: number
}

export function make(overrides: Overrides): Sells {
  return Sells.build({
    date: faker.date.recent(),
    cash: faker.datatype.boolean(),
    priceOverride: null,
    quantity: faker.datatype.number(10),
    value: faker.datatype.number({ max: 20000, precision: 100 }),
    deleted: false,
    batchId: null,

    ...overrides,
  })
}

export default async function create(
  overrides: Overrides,
  queryOpts?: SaveOptions,
): Promise<Sells> {

  const model = make(overrides)
  return model.save(queryOpts)
}
