import faker from 'faker'
import { Storages } from '../models.js'
import type { SaveOptions } from 'sequelize'

export function make(overrides?: Record<string, unknown>): Storages {
  return Storages.build({
    code: faker.lorem.slug(),
    name: faker.commerce.department(),

    ...overrides,
  })
}

export default async function create(
  overrides?: Record<string, unknown>,
  queryOpts?: SaveOptions,
): Promise<Storages> {

  const model = make(overrides)
  return model.save(queryOpts)
}
