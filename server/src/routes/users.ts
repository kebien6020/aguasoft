import { Request, Response, NextFunction } from 'ultimate-express'
import { Users } from '../db/models.js'
import bcrypt from 'bcryptjs'

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await Users.findAll({
      attributes: ['id', 'name', 'code', 'role'],
      order: [['code', 'ASC']],
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
    if (!user) {
      res.json({
        result: false,
        error: {
          message: 'User not found: ' + userId,
          code: 'user_not_found',
        },
      })
      return
    }

    const savedHash = user.password
    const result = await bcrypt.compare(providedPass, savedHash)

    if (!result) {
      res.json({
        result: false,
        error: {
          message: 'Incorrect password',
          code: 'incorrect_password',
        },
      })
      return
    }

    // If the correct pass was provided save the userId to the session
    req.session.userId = result ? userId : undefined

    res.json({ result })
  } catch (e) {
    next(e)
  }
}

export async function getCurrent(req: Request, res: Response, next: NextFunction) {
  try {
    // If there is no user logged in return an error
    if (!req.session.userId) {
      res.json({
        success: false,
        error: {
          message: 'There is not an active session',
          code: 'no_user',
        },
      })
      return
    }

    // Find all of the user info from the id
    const user = await Users.findByPk(req.session.userId, {
      attributes: ['name', 'code', 'id', 'role'],
    })

    res.json(user)
  } catch (e) {
    next(e)
  }
}
