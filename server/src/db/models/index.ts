// This file is called index so you can require the whole folder
import * as fs from 'fs'
import * as path from 'path'
import * as makeDebug from 'debug'
import { Sequelize } from 'sequelize'
import { ModelStatic } from '../type-utils'
import { BalanceVerificationStatic } from './balanceVerifications'
import { ClientStatic } from './clients'
import { InventoryElementStatic } from './inventoryElements'
import { InventoryMovementStatic } from './inventoryMovements'
import { MachineCounterStatic } from './machineCounters'
import { PaymentStatic } from './payments'
import { PriceStatic } from './prices'
import { ProductStatic } from './products'
import { SellStatic } from './sells'
import { SessionStatic } from './session'
import { SpendingStatic } from './spendings'
import { StorageStatic } from './storages'
import { StorageStateStatic } from './storageStates'
import { UserStatic } from './users'
import { ProductVariantStatic } from './productVariant'
const debug = makeDebug('app:db:setup')

const thisFile = path.basename(module.filename)
// Find out the environment
const env = process.env.NODE_ENV || 'development'
// load the config for this environment
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require(path.resolve(__dirname, '../config.json'))[env]

// Log database connection
debug(`Using ${config.dialect} database, in storage ${config.storage}`)
// Set logger for sql querys done by sequelize
const debugSql = makeDebug('sql:general')
config.logging = (sql: string) => debugSql(sql)
config.logQueryParameters = true
// Connect
const sequelize = new Sequelize(config.database, config.username, config.password, config)
// sequelize.query('PRAGMA journal_mode = WAL;', {raw: true})

// Here will be placed all the model classes
const models: { [idx: string]: ModelStatic } = {}
// Load all models in this folder (remember to exclude this file)
fs
  .readdirSync(__dirname)
  .filter(file => file.indexOf('.') !== 0 && file !== thisFile && /\.(js|ts)$/.test(file))
  .map(function(file) {
    debug(`trying to Sequelize.import ${file}`)
    // Models have to be in a specific way for them to be
    // able to be imported by Sequelize.prototype.import
    const model = sequelize.import<ModelStatic>(path.join(__dirname, file))
    // Log all added models
    debug(`adding ${model.name} to models`)
    // Actually add them to the db object
    models[model.name] = model
    return model
  })
  // Setup model associations
  .forEach(model => {
    if (model.associate) {
      debug(`setting up ${model.name} associations`)
      model.associate(models)
    }
  })

export default models as {
  BalanceVerifications: BalanceVerificationStatic
  Clients: ClientStatic
  InventoryElements: InventoryElementStatic
  InventoryMovements: InventoryMovementStatic
  MachineCounters: MachineCounterStatic
  Payments: PaymentStatic
  Prices: PriceStatic
  Products: ProductStatic
  ProductVariants: ProductVariantStatic
  Sells: SellStatic
  Session: SessionStatic
  Spendings: SpendingStatic
  Storages: StorageStatic
  StorageStates: StorageStateStatic
  Users: UserStatic
}

// Add sequelize instance and class to the exports
export { sequelize, Sequelize }
