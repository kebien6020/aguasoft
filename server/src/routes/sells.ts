import { Request, Response, NextFunction } from 'express'
import models from '../db/models'
import { SellStatic, Sell } from '../db/models/sells'
import { PriceStatic } from '../db/models/prices'
import { Op, Includeable } from 'sequelize'

const Sells = models.Sells as SellStatic
const Prices = models.Prices as PriceStatic

export async function list(_req: Request, res: Response, next: NextFunction) {
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
          attributes: ['name', 'basePrice', 'id'],
        },
        {
          model: models.Clients,
          attributes: ['name', 'id', 'defaultCash'],
        },
        {
          model: models.Users,
          attributes: ['name', 'code'],
          paranoid: false,
        } as Includeable,
      ],
      order: [['updatedAt', 'DESC']]
    })

    const allPrices = await Prices.findAll({
      attributes: ['name', 'value', 'productId', 'clientId']
    })

    // Convert to array of plain objects so that we can
    // add extra members to it
    interface ResponseElem extends Sell {
      Prices?: {name: string, value: string}[]
    }

    const sellsPlain : ResponseElem[] = sells.map(s => s.toJSON() as Sell)

    for (const sell of sellsPlain) {
      const prices = allPrices.filter(price =>
        price.clientId === sell.Client.id &&
        price.productId === sell.Product.id
      )

      if (prices.length !== 0) {
        sell.Prices = prices.map(p => ({name: p.name, value: p.value}))
      } else {
        sell.Prices = [{
          'name': 'Base',
          'value': sell.Product.basePrice
        }]
      }
    }

    res.json(sellsPlain)
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
          [Op.gt]: fromId,
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
          paranoid: false,
        } as Includeable,
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
    const sell = await Sells.findByPk(sellId)
    sell.set('deleted', true)
    await sell.save({silent: true}) // Do not touch updatedAt

    res.json({success: true})
  } catch (e) {
    next(e)
  }
}
