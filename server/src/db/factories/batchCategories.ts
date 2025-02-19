import faker from 'faker'
import { BatchCategories } from '../models.js'
import type { SaveOptions } from 'sequelize'

type Overrides = Record<string, unknown>

export function make(overrides?: Overrides): BatchCategories {
  return BatchCategories.build({
    code: String(faker.datatype.number({ min: 1000, max: 9999 })),
    name: faker.commerce.productName(),
    expirationDays: faker.datatype.number({ min: 1, max: 365 }),

    ...overrides,
  })
}

export default async function create(
  overrides?: Overrides,
  queryOpts?: SaveOptions,
): Promise<BatchCategories> {

  const model = make(overrides)
  return model.save(queryOpts)
}
