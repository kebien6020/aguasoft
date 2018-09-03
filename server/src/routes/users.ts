import { Request, Response, NextFunction } from 'express'
import models from '../db/models'
import { UserModel } from '../db/models/users'
import * as bcrypt from 'bcryptjs'

const Users = models.Users as UserModel

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await Users.findAll({
      attributes: ['id', 'name', 'code']
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

    const user = await Users.findById(userId)
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
    // If there is no user logged in simply return null
    if (!req.session.userId)
      return res.json(null)

    // Find all of the user info from the id
    const user = await Users.findById(req.session.userId, {
      attributes: ['name', 'code', 'id']
    })

    res.json(user)
  } catch (e) {
    next (e)
  }
}
