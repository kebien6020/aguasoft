import { Request, Response, NextFunction } from 'express'
import models from '../db/models'
import { UserModel } from '../db/models/users'
import * as bcrypt from 'bcryptjs'

const Users = models.Users as UserModel

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await Users.findAll({
      attributes: ['id', 'name', 'code', 'role']
    })

    res.json(users)
  } catch (e) {
    next(e)
  }
}

export async function checkUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.body.id
    const providedPass = req.body.password

    const user = await Users.findByPk(userId)
    if (!user) return res.json({result: false})

    const savedHash = user.password
    const result = await bcrypt.compare(providedPass, savedHash)

    // If the correct pass was provided save the userId to the session
    req.session.userId = result ? userId : undefined

    res.json({result})
  } catch (e) {
    next (e)
  }
}

export async function getCurrent(req: Request, res: Response, next: NextFunction) {
  try {
    // If there is no user logged in return an error
    if (!req.session.userId)
      return res.json({
        success: false,
        error: {
          message: 'There is not an active session',
          code: 'no_user',
        },
      })

    // Find all of the user info from the id
    const user = await Users.findByPk(req.session.userId, {
      attributes: ['name', 'code', 'id', 'role']
    })

    res.json(user)
  } catch (e) {
    next (e)
  }
}
