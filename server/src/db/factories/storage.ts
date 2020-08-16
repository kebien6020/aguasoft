import models from '../models'
import * as faker from 'faker'
import { Storage } from '../models/storages'
import { SaveOptions } from 'sequelize/types'
const { Storages } = models

export function make(overrides?: Record<string, unknown>): Storage {
  return Storages.build({
    code: faker.lorem.slug,
    name: faker.commerce.department,

    ...overrides,
  })
}

export default async function create(
  overrides?: Record<string, unknown>,
  queryOpts?: SaveOptions
): Promise<Storage> {

  const model = make(overrides)
  return model.save(queryOpts)
}
