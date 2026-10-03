import { sequelize } from '../db/sequelize.js'
import { Umzug, SequelizeStorage } from 'umzug'
import { DataTypes } from '@sequelize/core'

const umzug = new Umzug({
  migrations: {
    glob: [
      '../db/migrations/*.js', {
        cwd: import.meta.dirname,
      },
    ],
  },
  context: {
    sequelize: sequelize,
    DataTypes: DataTypes,
    queryInterface: sequelize.getQueryInterface(),
  },
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
})

await umzug.up()
