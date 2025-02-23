import { faker } from '@faker-js/faker'
import { Spendings } from '../models.js'
import type { SaveOptions } from 'sequelize'

type Overrides = Record<string, unknown> & {
  userId: number
}

export function make(overrides: Overrides): Spendings {
  return Spendings.build({
    date: faker.date.recent(),
    description: faker.lorem.sentence(),
    value: String(faker.number.int({ max: 100000, multipleOf: 100 })),
    fromCash: faker.datatype.boolean(),
    isTransfer: faker.number.int(100) <= 5,

    ...overrides,
  })
}

export default async function create(
  overrides: Overrides,
  queryOpts?: SaveOptions,
): Promise<Spendings> {

  const model = make(overrides)
  return model.save(queryOpts)
}
