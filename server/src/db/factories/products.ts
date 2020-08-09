import models from '../models'
import * as faker from 'faker'
import { Product } from '../models/products'
import { SaveOptions } from 'sequelize/types'
const { Products } = models

export function make(overrides?: Record<string, unknown>): Product {
  return Products.build({
    name: faker.commerce.productName(),
    code: faker.random.alphaNumeric(3),
    basePrice: faker.random.number({ max: 10000, precision: 100 }),

    ...overrides,
  })
}

export default async function create(
  overrides?: Record<string, unknown>,
  queryOpts?: SaveOptions
): Promise<Product> {

  const model = make(overrides)
  return model.save(queryOpts)
}
