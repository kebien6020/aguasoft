import { sequelize } from '../db/sequelize.js'
import { Umzug, SequelizeStorage } from 'umzug'
import { DataTypes } from '@sequelize/core'
import { db } from '../db2/db.js'
import debug from 'debug'

debug.enable('db2:*,db:*,*:timings')

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
    queryInterface: sequelize.queryInterface,
    db: db,
  },
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
})

await umzug.up()
