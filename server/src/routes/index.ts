import { Router } from 'express'

import * as userHandlers from './users'

export const users = Router()
users.get('/', userHandlers.list)
