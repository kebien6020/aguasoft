import { Request, Response, NextFunction } from 'express'
import models, { sequelize } from '../db/models'
import { InventoryElementStatic } from '../db/models/inventoryElements'
import { SellStatic, Sell } from '../db/models/sells'
import { PriceStatic } from '../db/models/prices'
import { ProductStatic } from '../db/models/products'
import { StorageStatic } from '../db/models/storages'
import { Op, Includeable } from 'sequelize'
import { CreateManualMovementArgs, createMovement } from './inventory'

const Sells = models.Sells as SellStatic
const Prices = models.Prices as PriceStatic
const Products = models.Products as ProductStatic
const InventoryElements = models.InventoryElements as InventoryElementStatic
const Storages = models.Storages as StorageStatic

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

export async function create(_req: Request, _res: Response, next: NextFunction) {
  try {
    throw Error('Method disabled')
    // const body = req.body
    //
    // if (!req.session.userId) {
    //   const e = Error('User is not logged in')
    //   e.name = 'user_check_error'
    //   throw e
    // }
    //
    // body.userId = req.session.userId
    //
    // await Sells.create(body, {
    //   // Only allow user input to control these attributes
    //   fields: [
    //     'date',
    //     'clientId',
    //     'productId',
    //     'quantity',
    //     'value',
    //     'cash',
    //     'userId'
    //   ],
    // })
    //
    // res.json({success: true})
  } catch (e) {
    next(e)
  }
}

const productInventoryElement = {
  '001': 'paca-360',
  '002': 'bolsa-6l',
  '003': 'botellon',
  '004': 'hielo-5kg',
  '005': 'botellon',
  '006': 'base-botellon',
  '007': 'hielo-2kg',
  '008': 'botella-600ml',
  '009': 'bolsa-360-congelada',
} as const

type ProductCode = keyof typeof productInventoryElement
type InventoryElementCode = (typeof productInventoryElement)[ProductCode]

const isProductCode = (code: string): code is ProductCode => {
  return productInventoryElement.hasOwnProperty(code)
}

const productToInventoryElementCode = (code: string) : InventoryElementCode|undefined => {
  if (isProductCode(code))
    return productInventoryElement[code]

  return undefined
}

export async function bulkCreate(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.userId) {
      const e = Error('User is not logged in')
      e.name = 'user_check_error'
      throw e
    }

    const userId = req.session.userId

    let { sells } = req.body

    sells = sells.map((s: any) => Object.assign(s, {userId: req.session.userId}))

    const transaction = await sequelize.transaction()

    try {
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
        transaction,
      })

      for (const sell of sells) {

        const product = await Products.findOne({
          where: {id: sell.productId}
        })

        if (!product) {
          throw new Error(`No se encontró el producto ${sell.productId}`);
        }

        const elementCode = productToInventoryElementCode(product.code)

        // Skip this product, it can not be tracked
        if (elementCode === 'botellon') continue

        const inventoryElement = await InventoryElements.findOne({
          where: {
            code: elementCode,
          },
        })

        if (!inventoryElement) {
          throw new Error(`No se encontró el elemento de inventario con el código ${elementCode}`)
        }

        const storageCode = 'terminado'

        const storageFrom = await Storages.findOne({
          where: {
            code: storageCode,
          },
        })

        if (!storageFrom) {
          throw new Error(`No se encontró el almacen con el código ${storageCode}`)
        }

        const movementData : CreateManualMovementArgs = {
          inventoryElementFromId: inventoryElement.id,
          inventoryElementToId: inventoryElement.id,
          storageFromId: storageFrom.id,
          storageToId: null,
          quantityFrom: sell.quantity,
          quantityTo: sell.quantity,
          cause: 'sell',
          createdBy: userId,
        }

        await createMovement(movementData, transaction)
      }

      await transaction.commit()

      res.json({success: true})
    } catch (err) {
      transaction.rollback()

      throw err
    }
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

export async function listDayFrom(req: Request, res: Response, next: NextFunction) {
  try {
    const fromId: string = req.query.fromId
    const firstSell = await Sells.findOne({
      where: {
        id: {
          [Op.gt]: fromId,
        },
      }
    })

    if (!firstSell) {
      res.json([])
      return
    }

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
        // Only get same day
        date: firstSell.date
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
    if (!req.session.userId) {
      const e = Error('User is not logged in')
      e.name = 'user_check_error'
      throw e
    }

    const userId = req.session.userId

    const sellId = req.params.id
    const sell = await Sells.findByPk(sellId)
    sell.set('deleted', true)

    const transaction = await sequelize.transaction()

    try {
      await sell.save({silent: true, transaction}) // Do not touch updatedAt

      const product = await Products.findOne({
        where: {id: sell.productId}
      })

      if (!product) {
        throw new Error(`No se encontró el producto ${sell.productId}`);
      }

      const elementCode = productToInventoryElementCode(product.code)

      // Skip this product, it can not be tracked
      if (elementCode !== 'botellon') {
        
        const inventoryElement = await InventoryElements.findOne({
          where: {
            code: elementCode,
          },
        })

        if (!inventoryElement) {
          throw new Error(`No se encontró el elemento de inventario con el código ${elementCode}`)
        }

        const storageCode = 'terminado'

        const storageTo = await Storages.findOne({
          where: {
            code: storageCode,
          },
        })

        if (!storageTo) {
          throw new Error(`No se encontró el almacen con el código ${storageCode}`)
        }

        const movementData : CreateManualMovementArgs = {
          inventoryElementFromId: inventoryElement.id,
          inventoryElementToId: inventoryElement.id,
          storageFromId: null,
          storageToId: storageTo.id,
          quantityFrom: sell.quantity,
          quantityTo: sell.quantity,
          cause: 'sell',
          createdBy: userId,
          rollback: true,
        }

        await createMovement(movementData, transaction)

      }

      await transaction.commit()

      res.json({success: true})
    } catch (err) {
      transaction.rollback()

      throw err
    }

    res.json({success: true})
  } catch (e) {
    next(e)
  }
}
