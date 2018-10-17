import { Request, Response, NextFunction } from 'express'
import models, { Sequelize } from '../db/models'
import { SellModel } from '../db/models/sells'

const Sells = models.Sells as SellModel
const { gt } = Sequelize.Op

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
        'userId',
        'priceOverride',
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
        'updatedAt',
        'deleted',
      ],
      where: {
        date: day
      },
      include: [
        {
          model: models.Products,
          attributes: ['name'],
        },
        {
          model: models.Clients,
          attributes: ['name'],
        },
        {
          model: models.Users,
          attributes: ['name'],
        },
      ],
      order: [['updatedAt', 'DESC']]
    })

    res.json(sells)
  } catch (e) {
    next(e)
  }
}

export async function listFrom(req: Request, res: Response, next: NextFunction) {
  try {
    const fromId: string = req.query.fromId
    const sells = await Sells.findAll({
      attributes: [
        'id',
        'date',
        'quantity',
        'value',
        'cash',
        'priceOverride',
        'updatedAt',
        'deleted',
      ],
      where: {
        id: {
          [gt]: fromId,
        },
      },
      include: [
        {
          model: models.Products,
          attributes: ['name'],
        },
        {
          model: models.Clients,
          attributes: ['name'],
        },
        {
          model: models.Users,
          attributes: ['name'],
        },
      ],
      order: [['id', 'ASC']]
    })

    res.json(sells)
  } catch (e) {
    next(e)
  }
}

export async function del(req: Request, res: Response, next: NextFunction) {
  try {
    const sellId = req.params.id
    const sell = await Sells.findById(sellId)
    sell.deleted = true
    await sell.save({silent: true}) // Do not touch updatedAt

    res.json({success: true})
  } catch (e) {
    next(e)
  }
}
