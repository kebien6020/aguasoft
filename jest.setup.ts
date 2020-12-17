/* eslint-env node, jest */

import * as path from 'path'
import { Sequelize } from 'sequelize'
import * as Umzug from 'umzug'
import { sequelize } from './server/src/db/models'

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
  console.log('Migations performed successfully')
}

beforeAll(async () => {
  await migrate()
})
