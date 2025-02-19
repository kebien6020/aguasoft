import faker from 'faker'
import { Products } from '../models.js'
import type { SaveOptions } from 'sequelize'

type Overrides = Record<string, unknown> & {
  batchCategoryId: number
}

export function make(overrides: Overrides): Products {
  return Products.build({
    name: faker.commerce.productName(),
    code: faker.random.alphaNumeric(3),
    basePrice: String(faker.datatype.number({ max: 10000, precision: 100 })),

    ...overrides,
  })
}

export default async function create(
  overrides: Overrides,
  queryOpts?: SaveOptions,
): Promise<Products> {

  const model = make(overrides)
  return model.save(queryOpts)
}
