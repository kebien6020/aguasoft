import { faker } from '@faker-js/faker'
import { Clients } from '../models.js'
import type { SaveOptions } from 'sequelize'

export function make(overrides?: Record<string, unknown>): Clients {
  return Clients.build({
    name: faker.person.fullName(),
    code: faker.string.alphanumeric(3),
    defaultCash: faker.datatype.boolean(),
    hidden: false,
    notes: faker.datatype.boolean() ? faker.lorem.sentence() : null,

    ...overrides,
  })
}

export default async function create(
  overrides?: Record<string, unknown>,
  queryOpts?: SaveOptions,
): Promise<Clients> {

  const model = make(overrides)
  return model.save(queryOpts)
}
