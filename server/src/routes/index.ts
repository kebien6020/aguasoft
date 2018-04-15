import { Router } from 'express'

import * as userHandlers from './users'
import * as clientHandlers from './clients'
import * as productHandlers from './products'
import * as priceHandlers from './prices'

export const users = Router()
users.get('/', userHandlers.list)
users.post('/check', userHandlers.checkUser)
users.get('/getCurrent', userHandlers.getCurrent)

export const clients = Router()
clients.get('/', clientHandlers.list)

export const products = Router()
products.get('/', productHandlers.list)

export const prices = Router()
prices.get('/:clientId', priceHandlers.list)
