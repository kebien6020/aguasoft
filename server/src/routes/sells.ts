import { NextFunction, Request, Response } from 'express'
import { Includeable, Op } from 'sequelize'
import * as yup from 'yup'
import { sequelize } from '../db/sequelize.js'
import {
  Sells,
  Prices,
  Products,
  ProductVariants,
  InventoryElements,
  Storages,
  Users,
  Clients,
  Batches,
  InventoryMovements,
} from '../db/models.js'
import { MakeRequired } from '../utils/types.js'
import { CreateManualMovementArgs, createMovement } from './inventory.js'
import { formatDateonly } from '../utils/date.js'


export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Yup typing weirdness
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const includeableSchema: yup.ArraySchema<yup.SchemaOf<Includeable>> = yup.array().of(yup.lazy(value => {

      if (typeof value === 'string') return yup.string()

      return yup.object({
        association: yup.string().required(),
        as: yup.string(),
        attributes: yup.array().of(yup.string()),
        paranoid: yup.boolean(),
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
  next(Error('Method disabled'))
}

const productMovementDetails = {
  '001': { main: [{ elementCode: 'paca-360' }], variants: {} },
  '002': { main: [{ elementCode: 'bolsa-6l' }], variants: {} },
  '003': {
    main: [{ elementCode: 'termoencogible', storageCode: 'trabajo' }],
    variants: {
      'tapa-valvula': [{ elementCode: 'tapa-valvula', storageCode: 'trabajo' }],
      'tapa-sencilla': [{ elementCode: 'tapa-sencilla', storageCode: 'trabajo' }],
    },
  },
  '004': { main: [{ elementCode: 'hielo-5kg' }], variants: {} },
  '005': {
    main: [
      { elementCode: 'botellon-nuevo', storageCode: 'bodega' },
      { elementCode: 'termoencogible', storageCode: 'trabajo' },
    ],
    variants: {
      'tapa-valvula': [{ elementCode: 'tapa-valvula', storageCode: 'trabajo' }],
      'tapa-sencilla': [{ elementCode: 'tapa-sencilla', storageCode: 'trabajo' }],
    },
  },
  '006': { main: [{ elementCode: 'base-botellon' }], variants: {} },
  '007': { main: [{ elementCode: 'hielo-2kg' }], variants: {} },
  '008': { main: [{ elementCode: 'botella-600ml' }], variants: {} },
  '009': { main: [{ elementCode: 'bolsa-360-congelada' }], variants: {} },
  '010': {
    main: [{ elementCode: 'bomba-electrica-botellon', storageCode: 'bodega' }],
    variants: {},
  },
  '011': { main: [{ elementCode: 'barra-hielo' }], variants: {} },
} as const

type ProductCode = keyof typeof productMovementDetails
type StorageCode = 'trabajo' | 'bodega' | 'terminado'

interface MovementDetails {
  elementCode: string
  storageCode?: StorageCode
}

const isProductCode = (code: string): code is ProductCode => {
  return Object.prototype.hasOwnProperty.call(productMovementDetails, code) as boolean
}

class VariantCodeNotFound extends Error { // Not AppError because this is configuration error
  constructor(productCode: string, variantCode: string) {
    super(`Product variant ${variantCode} not recognized for product code ${productCode}`)
  }
}

const movementDetails = (code: string, variantCode?: string): readonly MovementDetails[] | undefined => {
  if (!isProductCode(code))
    return undefined

  const productDetails = productMovementDetails[code]
  const mainMovementDetails = productDetails.main as unknown as MovementDetails[] | undefined

  if (!variantCode)
    return mainMovementDetails

  const variants = productDetails.variants as Record<string, MovementDetails[] | undefined>

  const variantMovementDetails = variants[variantCode]
  if (!variantMovementDetails)
    throw new VariantCodeNotFound(code, variantCode)

  return mainMovementDetails?.concat(variantMovementDetails)
}

const getLoggedUserId = (req: Request) => {
  const userId = req.session?.userId as unknown

  if (typeof userId !== 'number') {
    const e = Error('User is not logged in')
    e.name = 'user_check_error'
    throw e
  }

  return userId
}

type ExpressHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>

type SuccessBody = {
  success: true
}

interface ErrorBody {
  success: false
  error: {
    message: string
    code: string
    // On validation_error
    errors?: {
      path: string
      name: string
    }[]
  }
}

type SuccessRes<T> = { status: 200, body: T & SuccessBody }
type Handler<T> = (req: Request) => Promise<SuccessRes<T>>

const ok = <T extends Record<string, unknown>>(body?: T): SuccessRes<T> => ({
  status: 200,
  body: {
    ...body,
    success: true,
  },
} as SuccessRes<T>)

class AppError extends Error {
  status = 500
  code = 'unknown'
}

const wrap = <T>(hnd: Handler<T>): ExpressHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const appRes = await hnd(req)
      const status = appRes.status ?? 200
      res.status(status).json(appRes.body)
    } catch (err) {
      if (err instanceof AppError) {
        const body: ErrorBody = {
          error: err,
          success: false,
        }
        res.status(err.status).json(body)
        return
      }

      console.warn(err)
      next(err)
    }
  }

type SchemaType<T> = T extends yup.Schema<infer Q> ? Q : never

const sellSchema = yup.object({
  cash: yup.boolean().required(),
  priceOverride: yup.number().nullable(),
  quantity: yup.number().required(),
  value: yup.number().required(),
  clientId: yup.number().required(),
  productId: yup.number().required(),
  variantId: yup.number().notRequired(),
  batchId: yup.number().nullable(),
  date: yup.date().notRequired(),
})
type SellInput = SchemaType<typeof sellSchema>

const sellsRequestSchema = yup.object({
  sells: yup.array().of(sellSchema).required(),
}).required()

type Rec = Record<string, unknown>

const getSells = (body: Rec): SellInput[] => {
  sellsRequestSchema.validateSync(body)
  return sellsRequestSchema.cast(body).sells
}

export const bulkCreate = wrap(async (req: Request) => {
  const userId = getLoggedUserId(req)
  const sellsInput = getSells(req.body as Rec)

  const user = await Users.findByPk(userId)
  if (!user) {
    const e = Error('User not found')
    e.name = 'user_check_error'
    throw e
  }

  const isAdmin = user.role === 'admin'
  const today = new Date

  const sells = sellsInput.map(s => ({
    ...s,
    userId,
    date: formatDateonly(isAdmin && s.date !== undefined && s.date !== null ? s.date : today),
    productVariantId: s.variantId ?? null,
  }))

  await sequelize.transaction(async (transaction) => {
    const sellModels = await Sells.bulkCreate(sells, {
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
        'batchId',
        'productVariantId',
      ],
      transaction,
    })

    for (const sell of sellModels) {

      const product = await Products.findOne({
        where: { id: sell.productId },
      })

      const variant = sell.productVariantId ? await ProductVariants.findOne({
        where: { id: sell.productVariantId },
      }) : undefined

      if (!product)
        throw new Error(`No se encontró el producto ${String(sell.productId)}`)


      const details = movementDetails(product.code, variant?.code) ?? []

      const inventoryElements = await InventoryElements.findAll({
        where: {
          code: {
            [Op.in]: details.map(d => d.elementCode),
          },
        },
      })

      const isStorageCode = (code: StorageCode | undefined): code is StorageCode =>
        Boolean(code)

      const storageCodes = [
        ...details.map(d => d.storageCode).filter(isStorageCode),
        'terminado',
      ] as const

      const storages = await Storages.findAll({
        where: {
          code: {
            [Op.in]: storageCodes,
          },
        },
      })

      const movements = [] as InventoryMovements[]

      for (const detail of details) {
        const storageFromCode = detail.storageCode || 'terminado'
        const elementCode = detail.elementCode

        const storageFrom = storages.find(s => s.code === storageFromCode)
        if (!storageFrom)
          throw new Error(`No se encontró el almacen con el código ${storageFromCode}`)


        const inventoryElement = inventoryElements.find(ie => ie.code === elementCode)
        if (!inventoryElement)
          throw new Error(`No se encontró el elemento de inventario con el código ${elementCode}`)


        const movementData: CreateManualMovementArgs = {
          inventoryElementFromId: inventoryElement.id,
          inventoryElementToId: inventoryElement.id,
          storageFromId: storageFrom.id,
          storageToId: null,
          quantityFrom: sell.quantity,
          quantityTo: sell.quantity,
          cause: 'sell',
          createdBy: userId,
        }

        const movement = await createMovement(movementData, transaction)
        movements.push(movement)
      }

      sell.movementIds = movements.map(m => m.id)
      await sell.save({ transaction })
    }

  })

  return ok()
})

export async function listDay(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const day = req.query.day
    if (typeof day !== 'string')
      throw new Error('day query parameter is required')


    type SellWithInclusions = MakeRequired<Sells, 'Product' | 'Client' | 'User' | 'Batch'>

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
          model: Products,
          attributes: ['name', 'basePrice', 'id'],
        },
        {
          model: Clients,
          attributes: ['name', 'id', 'defaultCash'],
        },
        {
          model: Users,
          attributes: ['name', 'code'],
          paranoid: false,
        } as Includeable,
        {
          model: Batches,
          attributes: ['code', 'id'],
        },
      ],
      order: [['updatedAt', 'DESC']],
    }) as SellWithInclusions[]

    const allPrices = await Prices.findAll({
      attributes: ['name', 'value', 'productId', 'clientId'],
    })

    // Convert to array of plain objects so that we can
    // add extra members to it
    interface ResponseElem extends SellWithInclusions {
      Prices?: { name: string, value: string }[]
    }

    const sellsPlain: ResponseElem[] = sells.map(s => s.toJSON() as SellWithInclusions)

    for (const sell of sellsPlain) {
      const prices = allPrices.filter(price =>
        price.clientId === sell.Client.id
        && price.productId === sell.Product.id,
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
          model: Products,
          attributes: ['name'],
        },
        {
          model: Clients,
          attributes: ['name'],
        },
        {
          model: Users,
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
      const e = Error('Debes iniciar sesión para eliminar ventas')
      e.name = 'user_check_error'
      throw e
    }

    const userId = req.session.userId

    const sellId = req.params.id
    const sell = await Sells.findByPk(sellId, {
      include: ['Variant'],
    })
    if (!sell) throw Error('No se encontró la venta a eliminar')

    if (sell.deleted)
      throw Error('Venta ya habia sido eliminada')

    const user = await Users.findByPk(userId)
    if (!user) throw Error('User not found')

    if (user.role !== 'admin') {
      const e = new Error('Solo usuarios admin pueden eliminar ventas')
      e.name = 'user_permission'
      throw e
    }


    sell.set('deleted', true)

    const transaction = await sequelize.transaction()

    try {
      await sell.save({ silent: true, transaction }) // Do not touch updatedAt

      const product = await Products.findOne({
        where: { id: sell.productId },
      })

      if (!product)
        throw new Error(`No se encontró el producto ${sell.productId}`)


      const variantCode = sell.Variant?.code
      const details = movementDetails(product.code, variantCode) ?? []

      const inventoryElements = await InventoryElements.findAll({
        where: {
          code: {
            [Op.in]: details?.map(d => d.elementCode),
          },
        },
      })

      const storageCodes = [...details.map(d => d.storageCode).filter(Boolean) as StorageCode[], 'terminado'] as const

      const storages = await Storages.findAll({
        where: {
          code: {
            [Op.in]: storageCodes,
          },
        },
      })

      for (const detail of details) {
        const storageToCode = detail.storageCode || 'terminado'
        const elementCode = detail.elementCode

        const storageTo = storages.find((s: Storages) => s.code === storageToCode)
        if (!storageTo)
          throw new Error(`No se encontró el almacen con el código ${storageToCode}`)


        const inventoryElement = inventoryElements.find(ie => ie.code === elementCode)
        if (!inventoryElement)
          throw new Error(`No se encontró el elemento de inventario con el código ${elementCode}`)


        const movementData: CreateManualMovementArgs = {
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
