import debug from 'debug'
import { Sequelize } from 'sequelize'
import configs from './config.js'
import { env } from '../utils/env.js'

const log = debug('app:db:setup')

const config = configs[env]

// Log database connection
log(`Using ${config.dialect} database, in storage ${config.storage}`)
// Set logger for sql querys done by sequelize
const logSql = debug('sql:general')
const augmentedConfig = {
  ...config,
  benchmark: true,
  logging: (sql: string, timing?: number) => logSql('%s - (%dms)', sql, timing),
}
// Connect
export const sequelize = new Sequelize(augmentedConfig)
