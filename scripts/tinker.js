const path = require('path')
const rel = str => path.join(__dirname, str)
const models = require(rel('../server/dist/db/models')).default
const bcrypt = require('bcryptjs')
const Sequelize = require('sequelize')

const Clients = models.Clients
const Prices = models.Prices
const Products = models.Products
const Sells = models.Sells
const Session = models.Session
const Users = models.Users
const InventoryElements = models.InventoryElements
const InventoryMovements = models.InventoryMovements
const Storages = models.Storages
const StorageStates = models.StorageStates

global.models = models
global.Clients = models.Clients
global.Prices = models.Prices
global.Products = models.Products
global.Sells = models.Sells
global.Session = models.Session
global.Users = models.Users
global.InventoryElements = models.InventoryElements
global.InventoryMovements = models.InventoryMovements
global.Storages = models.Storages
global.StorageStates = models.StorageStates
global.sequelize = models.sequelize
global.Sequelize = Sequelize

global.bcrypt = bcrypt

// After this drop into interactive shell
