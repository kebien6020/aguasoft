// Middleware that checks that the user is admin on api routes
// Client-side routes are checked in the client but the endpoints they call
// must be protected in the server

import { Request, Response, NextFunction } from 'express'
import { Users } from '../db/models.js'

export default
async function adminOnly(req: Request, _res: Response, next: NextFunction) {
  try {
    if (!req.session.userId) {
      const e = Error('User is not logged in')
      e.name = 'user_check_error'
      throw e
    }

    const id = req.session.userId
    const user = await Users.findByPk(id)

    if (!user) {
      const e = Error('User not found')
      e.name = 'user_check_error'
      throw e
    }

    if (user.role !== 'admin') {
      const e = Error(req.path + ' is admin only')
      e.name = 'unauthorized'
      throw e
    }

    next()
  } catch (e) {
    next(e)
  }
}
