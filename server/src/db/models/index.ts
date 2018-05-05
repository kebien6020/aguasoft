// This file is called index so you can require the whole folder
import * as fs from 'fs'
import * as path from 'path'
import * as makeDegub from 'debug'
import * as Sequelize from 'sequelize'
const debug = makeDegub('app:db')

const thisFile = path.basename(module.filename)
// Find out the environment
const env = process.env.NODE_ENV || 'development'
// load the config for this environment
const config = require(path.resolve(__dirname, '../config.json'))[env]
// Here will be placed all the model classes
interface DBExport {
  sequelize: Sequelize.Sequelize
  Sequelize: Sequelize.SequelizeStatic
  [idx: string]: Sequelize.Model<any, any> |
                 Sequelize.Sequelize |
                 Sequelize.SequelizeStatic
}

// Log database connection
debug(`Using ${config.dialect} database, in storage ${config.storage}`)
// Set logger for sql querys done by sequelize
config.logging = require('debug')('app:sql')
// Connect
const sequelize = new Sequelize(config.database, config.username, config.password, config)

// Add sequelize instance and class to the exports
const db: DBExport = {
  sequelize: sequelize,
  Sequelize: Sequelize
}
// Load all models in this folder (remember to exclude this file)
fs
  .readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== thisFile) && (file.slice(-3) === '.js'))
  .map(function(file) {
      // Models have to be in a specific way for them to be
      // able to be imported by Sequelize.prototype.import
    const model = sequelize.import(path.join(__dirname, file))
      // Log all added models
    debug(`adding ${model.name} to models`)
      // Actually add them to the db object
    db[model.name] = model
    return model
  })
  // Setup model associations
  .forEach(model => {
    if (model.associate) {
      debug(`setting up ${model.name} associations`)
      model.associate(db as Sequelize.Models)
    }
  })

export default db
