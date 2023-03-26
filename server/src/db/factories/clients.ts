import models from '../models'
import * as faker from 'faker'
import { Client } from '../models/clients'
import { SaveOptions } from 'sequelize/types'
const { Clients } = models

export function make(overrides?: Record<string, unknown>): Client {
  return Clients.build({
    name: faker.name.findName(),
    code: faker.random.alphaNumeric(3),
    defaultCash: faker.datatype.boolean(),
    hidden: false,
    notes: faker.datatype.boolean() ? faker.lorem.sentence() : null,

    ...overrides,
  })
}

export default async function create(
  overrides?: Record<string, unknown>,
  queryOpts?: SaveOptions
): Promise<Client> {

  const model = make(overrides)
  return model.save(queryOpts)
}
