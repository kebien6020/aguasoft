import { Request, Response, NextFunction } from 'express'
import models from '../db/models'
import { SellModel } from '../db/models/sells'
import { ProductModel } from '../db/models/products'
import { ClientModel } from '../db/models/clients'
import { UserModel } from '../db/models/users'

const Sells = models.Sells as SellModel

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const sells = await Sells.findAll({
      attributes: [
        'id',
        'date',
        'clientId',
        'productId',
        'quantity',
        'value',
        'cash',
        'userId',
      ],
    })

    res.json(sells)
  } catch (e) {
    next(e)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body

    if (!req.session.userId) {
      const e = Error('User is not logged in')
      e.name = 'user_check_error'
      throw e
    }

    body.userId = req.session.userId

    await Sells.create(body, {
      // Only allow user input to control these attributes
      fields: [
        'date',
        'clientId',
        'productId',
        'quantity',
        'value',
        'cash',
        'userId'
      ],
    })

    res.json({success: true})
  } catch (e) {
    next(e)
  }
}

export async function bulkCreate(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.userId) {
      const e = Error('User is not logged in')
      e.name = 'user_check_error'
      throw e
    }

    let { sells } = req.body

    sells = sells.map((s: any) => Object.assign(s, {userId: req.session.userId}))
    console.log(sells)
    await Sells.bulkCreate(sells, {
      // Only allow user input to control these attributes
      fields: [
        'date',
        'clientId',
        'productId',
        'quantity',
        'value',
        'cash',
        'userId'
      ],
    })

    res.json({success: true})
  } catch (e) {
    next(e)
  }
}

export async function listDay(req: Request, res: Response, next: NextFunction) {
  try {
    const day = req.query.day
    const sells = await Sells.findAll({
      attributes: [
        'id',
        'date',
        'quantity',
        'value',
        'cash',
        'priceOverride',
      ],
      where: {
        date: day
      },
      include: [
        {
          model: models.Products as ProductModel,
          attributes: ['name'],
        },
        {
          model: models.Clients as ClientModel,
          attributes: ['name'],
        },
        {
          model: models.Users as UserModel,
          attributes: ['name'],
        },
      ],
    })

    res.json(sells)
  } catch (e) {
    next(e)
  }
}
