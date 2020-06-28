import models from '../models'
import * as faker from 'faker'
import { User } from '../models/users'
const { Users } = models

export function make(overrides?: Record<string, unknown>): User {
  return Users.build({
    name: faker.name.findName(),
    code: faker.random.alphaNumeric(3),
    password: '$2a$10$BBm24baQR5zI72VhMaBwUevuMDydglZ.0N3vpzDA8oKd183Igm9UO', // secret
    role: 'seller',
    ...overrides,
  })
}

export default async function create(overrides?: Record<string, unknown>): Promise<User> {
  const model = make(overrides)
  return await model.save()
}
