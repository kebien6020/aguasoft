import { Router } from 'express'

import * as userHandlers from './users'
import * as clientHandlers from './clients'
import * as productHandlers from './products'
import * as priceHandlers from './prices'
import * as sellHandlers from './sells'
import * as paymentHandlers from './payments'
import * as spendingHandlers from './spendings'
import * as inventoryHandlers from './inventory'

import adminOnly from '../utils/adminOnly'

export const users = Router()
users.get('/', userHandlers.list)
users.post('/check', userHandlers.checkUser)
users.get('/getCurrent', userHandlers.getCurrent)

export const clients = Router()
clients.get('/', clientHandlers.list)
clients.get('/defaultsForNew', clientHandlers.defaultsForNew)
clients.post('/create', adminOnly, clientHandlers.create)
clients.patch('/:id', adminOnly, clientHandlers.update)
clients.get('/:id', clientHandlers.detail)
clients.delete('/:id', adminOnly, clientHandlers.remove)
clients.post('/:id/hide', adminOnly, clientHandlers.hide)
clients.post('/:id/unhide', adminOnly, clientHandlers.unhide)
clients.get('/:id/balance', adminOnly, clientHandlers.balance)

export const products = Router()
products.get('/', productHandlers.list)

export const prices = Router()
prices.get('/:clientId', priceHandlers.list)

export const sells = Router()
sells.get('/', sellHandlers.list)
sells.post('/new', sellHandlers.create)
sells.post('/bulkNew', sellHandlers.bulkCreate)
sells.get('/listDay', sellHandlers.listDay)
sells.get('/listFrom', sellHandlers.listFrom)
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
inventory.post('/movements/manual', adminOnly, inventoryHandlers.manualMovement)
