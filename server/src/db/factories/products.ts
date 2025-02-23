import { faker } from '@faker-js/faker'
import { Products } from '../models.js'
import type { SaveOptions } from 'sequelize'

type Overrides = Record<string, unknown> & {
  batchCategoryId: number
}

export function make(overrides: Overrides): Products {
  return Products.build({
    name: faker.commerce.productName(),
    code: faker.string.alphanumeric(3),
    basePrice: String(faker.number.int({ max: 10000, multipleOf: 100 })),

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
