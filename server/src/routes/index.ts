import { Router } from 'ultimate-express'
import adminOnly from '../utils/adminOnly.js'
import * as balanceHandlers from './balance.js'
import * as clientHandlers from './clients.js'
import * as inventoryHandlers from './inventory.js'
import * as machineCounterHandlers from './machineCounters.js'
import * as paymentHandlers from './payments.js'
import * as priceHandlers from './prices.js'
import * as productHandlers from './products.js'
import * as sellHandlers from './sells.js'
import * as spendingHandlers from './spendings.js'
import * as userHandlers from './users.js'


export { default as analysis } from './analysis.js'
export { default as batchCategories } from './batchCategories.js'
export { default as batches } from './batches.js'
export { default as priceSets } from './priceSets.js'

export const users = Router()
users.get('/', userHandlers.list)
users.post('/check', userHandlers.checkUser)
users.get('/getCurrent', userHandlers.getCurrent)

export const clients = Router()
clients.get('/', clientHandlers.list)
clients.get('/defaultsForNew', clientHandlers.defaultsForNew)
clients.get('/balances', clientHandlers.listBalances)
clients.post('/create', adminOnly, clientHandlers.create)
clients.patch('/:id', adminOnly, clientHandlers.update)
clients.get('/:id', clientHandlers.detail)
clients.delete('/:id', adminOnly, clientHandlers.remove)
clients.post('/:id/hide', adminOnly, clientHandlers.hide)
clients.post('/:id/unhide', adminOnly, clientHandlers.unhide)
clients.get('/:id/balance', clientHandlers.balance)

export const products = Router()
products.get('/', productHandlers.list)

export const prices = Router()
prices.get('/:clientId', priceHandlers.list)

export const sells = Router()
sells.get('/', sellHandlers.list)
sells.post('/new', sellHandlers.create)
sells.post('/bulkNew', sellHandlers.bulkCreate)
sells.get('/listDay', sellHandlers.listDay)
sells.get('/listFrom', sellHandlers.listDayFrom)
sells.delete('/:id', sellHandlers.del)

export const payments = Router()
payments.post('/new', paymentHandlers.create)
payments.get('/paginate', paymentHandlers.paginate)
payments.get('/listDay', paymentHandlers.listDay)
payments.get('/recent', paymentHandlers.listRecent)
payments.delete('/:id', paymentHandlers.del)

export const spendings = Router()
spendings.post('/new', spendingHandlers.create)
spendings.get('/paginate', spendingHandlers.paginate)
spendings.get('/listDay', spendingHandlers.listDay)
spendings.get('/recent', spendingHandlers.listRecent)
spendings.delete('/:id', spendingHandlers.del)

export const inventory = Router()
inventory.get('/storages', inventoryHandlers.listStorages)
inventory.get('/inventoryElements', inventoryHandlers.listInventoryElements)
inventory.get('/state', inventoryHandlers.listStorageStates)
inventory.get('/state/intermediate', inventoryHandlers.amountLeftInIntermediate)
inventory.post('/movements/manual', adminOnly, inventoryHandlers.manualMovement)
inventory.get('/movements', inventoryHandlers.listMovements)
inventory.post('/movements/production', inventoryHandlers.productionMovement)
inventory.post('/movements/damage', inventoryHandlers.damageMovement)
inventory.post('/movements/unpack', inventoryHandlers.unpackMovement)
inventory.post('/movements/relocation', inventoryHandlers.relocationMovement)
inventory.post('/movements/entry', inventoryHandlers.entryMovement)

export const machineCounters = Router()
machineCounters.get('/most-recent/production', machineCounterHandlers.mostRecentProduction)
machineCounters.get('/most-recent/new-reel', machineCounterHandlers.mostRecentNewReel)

export const balance = Router()
balance.get('/', balanceHandlers.listBalance)
balance.post('/verification', adminOnly, balanceHandlers.createBalanceVerification)
balance.get('/:date', balanceHandlers.showBalance)
