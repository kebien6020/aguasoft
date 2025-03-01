import { faker } from '@faker-js/faker'
import { Sells } from '../models.js'
import type { SaveOptions } from 'sequelize'
import { formatDateonly } from '../../utils/date.js'

type Overrides = Record<string, unknown> & {
  userId: number
  clientId: number
  productId: number
}

export function make(overrides: Overrides): Sells {
  return Sells.build({
    date: formatDateonly(faker.date.recent()),
    cash: faker.datatype.boolean(),
    priceOverride: null,
    quantity: faker.number.int(10),
    value: faker.number.int({ max: 20000, multipleOf: 100 }),
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
