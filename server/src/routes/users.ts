import { Request, Response, NextFunction } from 'express'
import models from '../db/models'
import { UserModel } from '../db/models/users'

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
