/* eslint-env node, jest */

import * as path from 'path'
import { Sequelize } from 'sequelize'
import * as Umzug from 'umzug'
import { sequelize } from './server/src/db/models'
import 'jest-extended'
import 'jest-extended/all' // Register matchers

const umzug = new Umzug({
  migrations: {
    path: path.join(__dirname, 'server/src/db/migrations'),
    params: [sequelize.getQueryInterface(), Sequelize],
  },
  storage: 'sequelize',
  storageOptions: {
    sequelize,
  },
})

const migrate = async () => {
  await umzug.up()
}

beforeAll(async () => {
  try {
    await migrate()
  } catch (e) {
    console.error('Error running migrations during test', e)
    throw e
  }
})
