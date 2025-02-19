import faker from 'faker'
import { Users } from '../models.js'
import type { SaveOptions } from 'sequelize'

export function make(overrides?: Record<string, unknown>): Users {
  return Users.build({
    name: faker.name.findName(),
    code: faker.random.alphaNumeric(3),
    password: '$2a$10$BBm24baQR5zI72VhMaBwUevuMDydglZ.0N3vpzDA8oKd183Igm9UO', // secret
    role: 'seller',
    ...overrides,
  })
}

export default async function create(
  overrides?: Record<string, unknown>,
  queryOpts?: SaveOptions,
): Promise<Users> {

  const model = make(overrides)
  const user = await model.save(queryOpts)
  return user
}
