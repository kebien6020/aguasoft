// Middleware that checks that the user is admin on api routes
// Client-side routes are checked in the client but the endpoints they call
// must be protected in the server

import { Request, Response, NextFunction } from 'express'
import models from '../db/models'
import { UserModel } from '../db/models/users'

const Users = models.Users as UserModel

export default
async function adminOnly(req: Request, _res: Response, next: NextFunction) {
  try {
    if (!req.session.userId) {
      const e = Error('User is not logged in')
      e.name = 'user_check_error'
      throw e
    }

    const user = await Users.findByPk(req.session.userId)

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
