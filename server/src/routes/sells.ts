import { NextFunction, Request, Response } from 'express'
import { Includeable, Op } from 'sequelize'
import * as yup from 'yup'
import models, { sequelize } from '../db/models'
import { Sell } from '../db/models/sells'
import { Storage } from '../db/models/storages'
import { Mutable } from '../utils/types'
import { CreateManualMovementArgs, createMovement } from './inventory'

const Sells = models.Sells
const Prices = models.Prices
const Products = models.Products
const InventoryElements = models.InventoryElements
const Storages = models.Storages

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const includeableSchema: yup.ArraySchema<Includeable> = yup.array().of<Includeable>(yup.lazy((val) => {
      if (typeof val === 'string') return yup.string()

      return yup.object({
        association: yup.string().required(),
        as: yup.string(),
        attributes: yup.array().of(yup.string()),
        include: yup.lazy(() => includeableSchema.default(undefined)),
      })
    }))
    const schema = yup.object({
      minDate: yup.date().notRequired(),
      maxDate: yup.date().notRequired(),
      include: includeableSchema.notRequired(),
      paranoid: yup.bool().notRequired(),
      clientId: yup.number().notRequired(),
    })

    schema.validateSync(req.query)
    const {
      minDate,
      maxDate,
      include,
      paranoid = false,
      clientId,
    } = schema.cast(req.query)

    const dateFilter = Object.assign(
      {},
      minDate ? { [Op.gte]: minDate } : null,
      maxDate ? { [Op.lte]: maxDate } : null,
    )

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
      where: {
        date: dateFilter,
        deleted: paranoid,
        ...(clientId && { clientId }),
      },
      include,
    })

    res.json(sells)
  } catch (e) {
    next(e)
  }
}

export function create(_req: Request, _res: Response, next: NextFunction): void {
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

const productMovementDetails = {
  '001': [{ elementCode: 'paca-360' }],
  '002': [{ elementCode: 'bolsa-6l' }],
  '003': [
    { elementCode: 'tapa-valvula', storageCode: 'trabajo' },
    { elementCode: 'termoencogible', storageCode: 'trabajo' },
  ],
  '004': [{ elementCode: 'hielo-5kg' }],
  '005': [
    { elementCode: 'botellon-nuevo', storageCode: 'bodega' },
    { elementCode: 'tapa-valvula', storageCode: 'trabajo' },
    { elementCode: 'termoencogible', storageCode: 'trabajo' },
  ],
  '006': [{ elementCode: 'base-botellon' }],
  '007': [{ elementCode: 'hielo-2kg' }],
  '008': [{ elementCode: 'botella-600ml' }],
  '009': [{ elementCode: 'bolsa-360-congelada' }],
  '010': [{ elementCode: 'bomba-electrica-botellon', storageCode: 'bodega' }],
} as const

type ProductCode = keyof typeof productMovementDetails
type ElementCode = (typeof productMovementDetails)[ProductCode][number]['elementCode']
type StorageCode = Extract<(typeof productMovementDetails)[ProductCode][number], {storageCode: string}>['storageCode']

interface MovementDetails {
  elementCode: ElementCode
  storageCode?: StorageCode
}

const isProductCode = (code: string): code is ProductCode => {
  return Object.prototype.hasOwnProperty.call(productMovementDetails, code) as boolean
}

const movementDetails = (code: string) : readonly MovementDetails[]|undefined => {
  if (isProductCode(code)) return productMovementDetails[code]

  return undefined
}

export async function bulkCreate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.session.userId) {
      const e = Error('User is not logged in')
      e.name = 'user_check_error'
      throw e
    }

    const userId = req.session.userId as number

    type Rec = Record<string, unknown>

    let sells = (req.body as Rec)?.sells as Rec[]

    sells = sells.map(s => Object.assign(s, { userId }))

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
          where: { id: sell.productId },
        })

        if (!product)
          throw new Error(`No se encontró el producto ${String(sell.productId)}`)


        const details = movementDetails(product.code)

        const inventoryElements = await InventoryElements.findAll({
          where: {
            code: {
              [Op.in]: details.map(d => d.elementCode),
            },
          },
        })

        const storageCodes = [...details.map(d => d.storageCode).filter(sc => sc), 'terminado'] as const

        const storages = await Storages.findAll({
          where: {
            code: {
              [Op.in]: storageCodes as Mutable<typeof storageCodes>,
            },
          },
        })

        for (const detail of details) {
          const storageFromCode = detail.storageCode || 'terminado'
          const elementCode = detail.elementCode

          const storageFrom = storages.find(s => s.code === storageFromCode)
          if (!storageFrom)
            throw new Error(`No se encontró el almacen con el código ${storageFromCode}`)


          const inventoryElement = inventoryElements.find(ie => ie.code === elementCode)
          if (!inventoryElement)
            throw new Error(`No se encontró el elemento de inventario con el código ${elementCode}`)


          const movementData : CreateManualMovementArgs = {
            inventoryElementFromId: inventoryElement.id,
            inventoryElementToId: inventoryElement.id,
            storageFromId: storageFrom.id,
            storageToId: null,
            quantityFrom: sell.quantity as number,
            quantityTo: sell.quantity as number,
            cause: 'sell',
            createdBy: userId,
          }

          await createMovement(movementData, transaction)
        }

      }

      await transaction.commit()

      res.json({ success: true })
    } catch (err) {
      void transaction.rollback()

      throw err
    }
  } catch (e) {
    console.warn(e)
    next(e)
  }
}

export async function listDay(req: Request, res: Response, next: NextFunction): Promise<void> {
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
        date: day,
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
      order: [['updatedAt', 'DESC']],
    })

    const allPrices = await Prices.findAll({
      attributes: ['name', 'value', 'productId', 'clientId'],
    })

    // Convert to array of plain objects so that we can
    // add extra members to it
    interface ResponseElem extends Sell {
      Prices?: {name: string, value: string}[]
    }

    const sellsPlain : ResponseElem[] = sells.map(s => s.toJSON() as Sell)

    for (const sell of sellsPlain) {
      const prices = allPrices.filter(price =>
        price.clientId === sell.Client.id
        && price.productId === sell.Product.id
      )

      if (prices.length !== 0) {
        sell.Prices = prices.map(p => ({ name: p.name, value: p.value }))
      } else {
        sell.Prices = [
          {
            name: 'Base',
            value: sell.Product.basePrice,
          },
        ]
      }
    }

    res.json(sellsPlain)
  } catch (e) {
    next(e)
  }
}

export async function listDayFrom(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const fromId = typeof req.query.fromId === 'string' ? req.query.fromId : undefined
    const firstSell = await Sells.findOne({
      where: {
        id: {
          [Op.gt]: fromId,
        },
      },
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
        date: firstSell.date,
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
      order: [['id', 'ASC']],
    })

    res.json(sells)
  } catch (e) {
    next(e)
  }
}

export async function del(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.session.userId) {
      const e = Error('User is not logged in')
      e.name = 'user_check_error'
      throw e
    }

    const userId = req.session.userId as number

    const sellId = req.params.id
    const sell = await Sells.findByPk(sellId)

    if (sell.deleted)
      throw Error('Venta ya habia sido eliminada')


    sell.set('deleted', true)

    const transaction = await sequelize.transaction()

    try {
      await sell.save({ silent: true, transaction }) // Do not touch updatedAt

      const product = await Products.findOne({
        where: { id: sell.productId },
      })

      if (!product)
        throw new Error(`No se encontró el producto ${sell.productId}`)


      const details = movementDetails(product.code)

      const inventoryElements = await InventoryElements.findAll({
        where: {
          code: {
            [Op.in]: details.map(d => d.elementCode),
          },
        },
      })

      const storageCodes = [...details.map(d => d.storageCode).filter(sc => sc), 'terminado'] as const

      const storages = await Storages.findAll({
        where: {
          code: {
            [Op.in]: storageCodes as Mutable<typeof storageCodes>,
          },
        },
      })

      for (const detail of details) {
        const storageToCode = detail.storageCode || 'terminado'
        const elementCode = detail.elementCode

        const storageTo = storages.find((s: Storage) => s.code === storageToCode)
        if (!storageTo)
          throw new Error(`No se encontró el almacen con el código ${storageToCode}`)


        const inventoryElement = inventoryElements.find(ie => ie.code === elementCode)
        if (!inventoryElement)
          throw new Error(`No se encontró el elemento de inventario con el código ${elementCode}`)


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
    } catch (err) {
      void transaction.rollback()

      throw err
    }

    res.json({ success: true })
  } catch (e) {
    next(e)
  }
}
