// This file is called index so you can require the whole folder
const fs = require('fs')
const path = require('path')
const makeDegub = require('debug')
const Sequelize = require('sequelize')
const debug = makeDegub('app:db')

const thisFile = path.basename(module.filename)
// Find out the environment
const env = process.env.NODE_ENV || 'development'
// load the config for this environment
const config = require(path.resolve(__dirname, '../config.json'))[env]

// Log database connection
debug(`Using ${config.dialect} database, in storage ${config.storage}`)
// Set logger for sql querys done by sequelize
config.logging = require('debug')('app:sql')
// Connect
const sequelize = new Sequelize(config.database, config.username, config.password, config)

// Here will be placed all the model classes
// Add sequelize instance and class to the exports
const db = {
  sequelize: sequelize,
  Sequelize: Sequelize
}
// Load all models in this folder (remember to exclude this file)
fs
  .readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== thisFile) && (file.slice(-3) === '.js'))
  .forEach(function(file) {
    // Models have to be in a specific way for them to be
    // able to be imported by Sequelize.prototype.import
    const model = sequelize.import(path.join(__dirname, file))
    // Log all added models
    debug(`adding ${model.name} to models`)
    // Actually add them to the db object
    db[model.name] = model
  })

// Setup model associations
Object.keys(db).forEach(modelName => {
  const model = db[modelName]
  if (model.associate) {
    debug(`setting up ${modelName} associations`)
    model.associate(db)
  }
})

module.exports = db
