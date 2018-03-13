import { Router } from 'express'

import * as userHandlers from './users'
import * as clientHandlers from './clients'

export const users = Router()
users.get('/', userHandlers.list)
users.post('/check', userHandlers.checkUser)

export const clients = Router()
clients.get('/', clientHandlers.list)
