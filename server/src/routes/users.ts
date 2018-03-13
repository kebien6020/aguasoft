import { Request, Response, NextFunction } from 'express'
import models from '../db/models'
import { UserModel } from '../db/models/users'
import * as bcrypt from 'bcrypt'

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

    res.json({result})
  } catch (e) {
    next (e)
  }
}
