import { Request, Response, NextFunction } from 'express'
import { InventoryMovements, InventoryElements, Storages, StorageStates, MachineCounters } from '../db/models.js'
import { sequelize } from '../db/sequelize.js'
import { CreationAttributes, Op, Transaction, WhereOptions } from 'sequelize'
import debug from 'debug'
import * as yup from 'yup'
import type { Mutable } from '../utils/types.js'

const logMovement = (sql: string) => debug('sql:movements')(sql)

export interface CreateManualMovementArgs {
  storageFromId: number | null
  storageToId: number | null
  inventoryElementFromId: number
  inventoryElementToId: number
  quantityFrom: number
  quantityTo?: number
  cause: InventoryMovements['cause']
  createdBy: number
  rollback?: boolean
}

class MovementError extends Error { }
class NotEnoughInSource extends MovementError {
  name = 'not_enough_in_source'
  message = 'Not enough inventory elements in source storage to perform the movement'

  storageId?: number
  storageCode?: string
  storageName?: string

  inventoryElementId?: number
  inventoryElementCode?: string
  inventoryElementName?: string

  constructor(storage?: Storages | null, inventoryElement?: InventoryElements | null) {
    super()

    if (storage) {
      this.storageId = storage.id
      this.storageCode = storage.code
      this.storageName = storage.name
    }

    if (inventoryElement) {
      this.inventoryElementId = inventoryElement.id
      this.inventoryElementCode = inventoryElement.code
      this.inventoryElementName = inventoryElement.name
    }
  }
}

async function _createMovementImpl(data: CreateManualMovementArgs, t: Transaction) {
  const opts = (obj = {}) => Object.assign(obj, {
    logging: logMovement,
    transaction: t,
    retry: {
      match: [/SQLITE_BUSY/],
      name: 'query',
      max: 5,
    },
  })

  // Update the storage state
  if (data.storageFromId) {
    const previousState = await StorageStates.findOne({
      where: { storageId: data.storageFromId, inventoryElementId: data.inventoryElementFromId },
      ...opts(),
    })

    if (previousState) {
      const oldQty = previousState.get('quantity')
      const newQty = Number(oldQty) - data.quantityFrom
      if (newQty < 0) {
        const storage = await Storages.findOne({ where: { id: data.storageFromId } })
        const inventoryElement = await InventoryElements.findOne({ where: { id: data.inventoryElementFromId } })

        throw new NotEnoughInSource(storage, inventoryElement)
      }
      previousState.set('quantity', String(newQty))

      await previousState.save({ ...opts() })
    } else {
      const storage = await Storages.findOne({ where: { id: data.storageFromId } })
      const inventoryElement = await InventoryElements.findOne({ where: { id: data.inventoryElementFromId } })

      throw new NotEnoughInSource(storage, inventoryElement)
    }
  }

  data.quantityTo ??= data.quantityFrom
  data.storageFromId ??= null
  const sData = data as unknown as CreationAttributes<InventoryMovements>

  if (data.storageToId) {
    const previousState = await StorageStates.findOne({
      where: { storageId: data.storageToId, inventoryElementId: data.inventoryElementToId },
      ...opts(),
    })

    if (previousState) {
      const oldQty = previousState.get('quantity')
      const newQty = Number(oldQty) + data.quantityTo
      previousState.set('quantity', String(newQty))

      await previousState.save({ ...opts() })
    } else {
      await StorageStates.create({
        storageId: data.storageToId,
        inventoryElementId: data.inventoryElementToId,
        quantity: String(+Number(data.quantityTo)),
      }, {
        ...opts(),
      })
    }
  }

  // Store the movement
  await InventoryMovements.create(sData, {
    fields: [
      'storageFromId',
      'storageToId',
      'inventoryElementFromId',
      'inventoryElementToId',
      'quantityFrom',
      'quantityTo',
      'cause',
      'createdBy',
      'rollback',
    ],
    ...opts(),
  })
}

export async function createMovement(data: CreateManualMovementArgs, transaction?: Transaction) {
  if (!data.quantityTo) data.quantityTo = data.quantityFrom
  if (transaction)
    return _createMovementImpl(data, transaction)


  await sequelize.transaction(async (t) => {
    return _createMovementImpl(data, t)
  })
}

export async function manualMovement(req: Request, res: Response, next: NextFunction) {
  try {

    if (!req.session.userId) {
      const e = Error('User is not logged in')
      e.name = 'user_check_error'
      throw e
    }

    const movementData: CreateManualMovementArgs = {
      storageFromId: req.body.storageFromId,
      storageToId: req.body.storageToId,
      inventoryElementFromId: req.body.inventoryElementFromId,
      inventoryElementToId: req.body.inventoryElementToId,
      quantityFrom: req.body.quantityFrom,
      quantityTo: req.body.quantityTo,
      cause: 'manual',

      createdBy: req.session.userId,
    }

    await createMovement(movementData)

    res.json({ success: true })
  } catch (e) {
    next(e)
  }
}

export async function listStorages(_req: Request, res: Response, next: NextFunction) {
  try {
    const storages = await Storages.findAll()

    res.json(storages)
  } catch (e) {
    next(e)
  }
}

export async function listInventoryElements(_req: Request, res: Response, next: NextFunction) {
  try {
    const inventoryElements = await InventoryElements.findAll()

    res.json(inventoryElements)
  } catch (e) {
    next(e)
  }
}

export async function listStorageStates(req: Request, res: Response, next: NextFunction) {
  try {
    const possibleInclussions = ['Storage', 'InventoryElement'] as const
    type PossibleInclussions = typeof possibleInclussions[number]

    const schema = yup.object({
      include: yup.array().of(
        yup.mixed<PossibleInclussions>().oneOf(possibleInclussions as Mutable<typeof possibleInclussions>).required(),
      ),
    })

    schema.validateSync(req.query)
    const query = schema.cast(req.query)

    const storageStates = await StorageStates.findAll({
      include: query.include,
    })

    res.json(storageStates)
  } catch (e) {
    next(e)
  }
}

export async function listMovements(req: Request, res: Response, next: NextFunction) {
  try {
    const possibleInclussions = [
      'storageFrom',
      'storageTo',
      'inventoryElementFrom',
      'inventoryElementTo',
      'creator',
      'deletor',
    ] as const

    type PossibleInclussions = typeof possibleInclussions[number]

    const schema = yup.object().noUnknown().shape({
      limit: yup.number(),
      sortField: yup.string(),
      sortDir: yup.string()
        .lowercase()
        .oneOf(['asc', 'desc'])
        .default('asc'),
      minDate: yup.date(),
      maxDate: yup.date(),
      cause: yup.string(),
      offset: yup.number(),
      inventoryElementId: yup.number(),
      include: yup.array().of(
        yup.mixed<PossibleInclussions>().oneOf(possibleInclussions as Mutable<typeof possibleInclussions>).required(),
      ),
    })

    schema.validateSync(req.query)
    const query = schema.cast(req.query)

    let where: WhereOptions = {}
    const createdAt: { [Op.gte]?: Date, [Op.lte]?: Date } = {}
    if (query.minDate)
      createdAt[Op.gte] = query.minDate

    if (query.maxDate)
      createdAt[Op.lte] = query.maxDate

    if (createdAt[Op.gte] || createdAt[Op.lte])
      where.createdAt = createdAt

    if (query.cause)
      where.cause = query.cause

    if (query.inventoryElementId) {
      where = {
        ...where,
        [Op.or]: [
          { inventoryElementFromId: query.inventoryElementId },
          { inventoryElementToId: query.inventoryElementId },
        ],
      }
    }

    const movements = await InventoryMovements.findAll({
      limit: query.limit,
      offset: query.offset,
      order: query.sortField ? [[query.sortField, query.sortDir]] : undefined,
      where,
      include: query.include,
    })

    const totalCount = await InventoryMovements.count({ where })

    res.json({ movements, totalCount })
  } catch (e) {
    next(e)
  }
}

type StorageCode = 'bodega' | 'trabajo' | 'intermedia' | 'terminado'
type InventoryElementCode =
  | 'paca-360'
  | 'bolsa-6l'
  | 'botellon'
  | 'hielo-5kg'
  | 'botellon-nuevo'
  | 'base-botellon'
  | 'hielo-2kg'
  | 'botella-600ml'
  | 'bolsa-360-congelada'
  | 'bolsa-6l-raw'
  | 'bolsa-360'
  | 'bolsa-hielo-5kg'
  | 'bolsa-hielo-2kg'
  | 'barra-hielo'

type ProductionType =
  | 'bolsa-360'
  | 'paca-360'
  | 'bolsa-6l'
  | 'hielo-5kg'
  | 'hielo-2kg'
  | 'bolsa-360-congelada'
  | 'barra-hielo'

type Without<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

interface ProductionInfoElement {
  storageFrom: StorageCode | null
  storageTo: StorageCode | null
  inventoryElementFrom: InventoryElementCode
  inventoryElementTo: InventoryElementCode
  damaged: null | Without<ProductionInfoElement, 'damaged'>
}

const productionInfo: { [idx in ProductionType]: ProductionInfoElement } = {
  'bolsa-360': {
    storageFrom: null,
    storageTo: 'intermedia',
    inventoryElementFrom: 'bolsa-360',
    inventoryElementTo: 'bolsa-360',
    damaged: null,
  },
  'paca-360': {
    storageFrom: 'intermedia',
    storageTo: 'terminado',
    inventoryElementFrom: 'bolsa-360',
    inventoryElementTo: 'paca-360',
    damaged: {
      storageFrom: 'intermedia',
      storageTo: null,
      inventoryElementFrom: 'bolsa-360',
      inventoryElementTo: 'bolsa-360',
    },
  },
  'bolsa-6l': {
    storageFrom: 'trabajo',
    storageTo: 'terminado',
    inventoryElementFrom: 'bolsa-6l-raw',
    inventoryElementTo: 'bolsa-6l',
    damaged: {
      storageFrom: 'trabajo',
      storageTo: null,
      inventoryElementFrom: 'bolsa-6l-raw',
      inventoryElementTo: 'bolsa-6l-raw',
    },
  },
  'hielo-5kg': {
    storageFrom: 'trabajo',
    storageTo: 'terminado',
    inventoryElementFrom: 'bolsa-hielo-5kg',
    inventoryElementTo: 'hielo-5kg',
    damaged: {
      storageFrom: 'trabajo',
      storageTo: null,
      inventoryElementFrom: 'bolsa-hielo-5kg',
      inventoryElementTo: 'bolsa-hielo-5kg',
    },
  },
  'hielo-2kg': {
    storageFrom: 'trabajo',
    storageTo: 'terminado',
    inventoryElementFrom: 'bolsa-hielo-2kg',
    inventoryElementTo: 'hielo-2kg',
    damaged: {
      storageFrom: 'trabajo',
      storageTo: null,
      inventoryElementFrom: 'bolsa-hielo-2kg',
      inventoryElementTo: 'bolsa-hielo-2kg',
    },
  },
  'bolsa-360-congelada': {
    storageFrom: 'intermedia',
    storageTo: 'terminado',
    inventoryElementFrom: 'bolsa-360',
    inventoryElementTo: 'bolsa-360-congelada',
    damaged: {
      storageFrom: 'intermedia',
      storageTo: null,
      inventoryElementFrom: 'bolsa-360',
      inventoryElementTo: 'bolsa-360',
    },
  },
  'barra-hielo': {
    storageFrom: null,
    storageTo: 'terminado',
    inventoryElementFrom: 'barra-hielo',
    inventoryElementTo: 'barra-hielo',
    damaged: null,
  },
}

const userLoggedCheck = (req: Request) => {
  if (!req.session.userId) {
    const e = Error('User is not logged in')
    e.name = 'user_check_error'
    throw e
  }
}

export async function productionMovement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    userLoggedCheck(req)

    const userId = Number(req.session.userId)

    const schema = yup.object({
      productionType: yup.mixed<ProductionType>().oneOf(Object.keys(productionInfo) as ProductionType[]).required(),
      amount: yup.number().integer().min(0).required(),
      damaged: yup.number().when('productionType', {
        is: (type: ProductionType) => productionInfo[type]?.damaged !== null,
        then: schema => schema.integer().min(0).required(),
      }),
      counterEnd: yup.number().when('productionType', {
        is: 'bolsa-360',
        then: schema => schema.integer().min(0).required(),
      }),
    })

    schema.validateSync(req.body)
    const body = schema.cast(req.body)

    const pType = body.productionType

    const [storages, elements] = await Promise.all([
      Storages.findAll(),
      InventoryElements.findAll(),
    ])
    const storageCodeToId = (code: string | null) => {
      const storage = storages.find(s => s.code === code)
      return storage ? storage.id : null
    }
    const elementCodeToId = (code: string | null) => {
      const element = elements.find(e => e.code === code)
      if (!element)
        throw new Error(`No se encontró un elemento de inventario con el código ${code}`)
      return element.id
    }

    const info = productionInfo[pType]

    const storageFromId = storageCodeToId(info.storageFrom)
    const storageToId = storageCodeToId(info.storageTo)
    const inventoryElementFromId = elementCodeToId(info.inventoryElementFrom)
    const inventoryElementToId = elementCodeToId(info.inventoryElementTo)

    const movementData = {
      storageFromId,
      storageToId,
      inventoryElementFromId,
      inventoryElementToId,
      quantityFrom: body.amount,
      quantityTo: body.amount,
      cause: 'production' as InventoryMovements['cause'],
      createdBy: userId,
    }

    if (pType === 'paca-360')
      movementData.quantityFrom = body.amount * 20


    const t = await sequelize.transaction()

    try {
      if (movementData.quantityFrom !== 0 && movementData.quantityTo !== 0)
        await createMovement(movementData, t)


      if (info.damaged && (body.damaged ?? 0) > 0) {
        const storageFromId = storageCodeToId(info.damaged.storageFrom)
        const storageToId = storageCodeToId(info.damaged.storageTo)
        const inventoryElementFromId = elementCodeToId(info.damaged.inventoryElementFrom)
        const inventoryElementToId = elementCodeToId(info.damaged.inventoryElementTo)

        const movementData = {
          storageFromId,
          storageToId,
          inventoryElementFromId,
          inventoryElementToId,
          quantityFrom: body.damaged ?? 0,
          cause: 'damage' as InventoryMovements['cause'],
          createdBy: userId,
        }

        await createMovement(movementData, t)
      }

      if (pType === 'bolsa-360') {
        if (typeof body.counterEnd !== 'number')
          throw Error('No se encontro contador final para movimiento de produccion de bolsas 360')


        await MachineCounters.create({
          value: body.counterEnd,
          type: 'production',
        }, {
          transaction: t,
          logging: (sql) => debug('sql:machine-counters')(sql),
        })
      }

      if (pType === 'paca-360') {
        // Move bolsa-reempaque
        const storageFromId = storageCodeToId('trabajo')
        const storageToId = null as null
        const inventoryElementFromId = elementCodeToId('bolsa-reempaque')
        const inventoryElementToId = inventoryElementFromId

        const movementData = {
          storageFromId,
          storageToId,
          inventoryElementFromId,
          inventoryElementToId,
          quantityFrom: body.amount,
          cause: 'relocation' as InventoryMovements['cause'],
          createdBy: userId,
        }

        await createMovement(movementData, t)
      }

      await t.commit()
      res.json({ success: true })

    } catch (err) {

      await t.rollback()
      throw err

    }

  } catch (e) {
    next(e)
  }
}

export async function amountLeftInIntermediate(_req: Request, res: Response, next: NextFunction) {
  try {
    const storage = await Storages.findOne({
      where: {
        code: 'intermedia',
      },
    })

    if (!storage) {
      res.json({
        'bolsa-360': 0,
      })

      return
    }

    const element = await InventoryElements.findOne({
      where: {
        code: 'bolsa-360',
      },
    })

    if (!element) {
      res.json({
        'bolsa-360': 0,
      })

      return
    }

    const storageState = await StorageStates.findOne({
      where: {
        storageId: storage.id,
        inventoryElementId: element.id,
      },
    })
    if (!storageState) throw new Error('No se encontró el almacen en el estado')

    res.json({
      'bolsa-360': storageState.quantity,
    })
  } catch (e) {
    next(e)
  }
}


const damageTypes = [
  'devolucion',
  'general',
] as const

type DamageType = (typeof damageTypes)[number]

export async function damageMovement(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.userId) {
      const e = Error('User is not logged in')
      e.name = 'user_check_error'
      throw e
    }

    const userId = Number(req.session.userId)

    const schema = yup.object({
      damageType: yup.mixed<DamageType>().oneOf(damageTypes as Mutable<typeof damageTypes>).required(),
      storageCode: yup.string().when('damageType', {
        is: 'general',
        then: schema => schema.required(),
      }),
      inventoryElementCode: yup.string().required(),
      amount: yup.number().integer().positive().required(),
    })

    schema.validateSync(req.body)
    const body = schema.cast(req.body)

    const inventoryElement = await InventoryElements.findOne({
      where: {
        code: body.inventoryElementCode,
      },
    })

    if (!inventoryElement)
      throw new Error(`No se encontró un elemento de inventario con el código ${body.inventoryElementCode}`)


    const storageCode = (() => {
      if (body.damageType === 'general')
        return body.storageCode as string


      if (body.inventoryElementCode === 'bolsa-360')
        return 'intermedia'


      return 'terminado'
    })()


    const storage = await Storages.findOne({
      where: {
        code: storageCode,
      },
    })

    if (!storage)
      throw new Error(`No se encontró el almacen con el código ${storageCode}`)


    const movementData: CreateManualMovementArgs = {
      inventoryElementFromId: inventoryElement.id,
      inventoryElementToId: inventoryElement.id,
      storageFromId: storage.id,
      storageToId: null,
      quantityFrom: body.amount,
      quantityTo: body.amount,
      cause: 'damage',
      createdBy: userId,
    }

    await createMovement(movementData)

    res.json({ success: true })

  } catch (err) {
    next(err)
  }
}

export async function unpackMovement(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.userId) {
      const e = Error('User is not logged in')
      e.name = 'user_check_error'
      throw e
    }

    const userId = Number(req.session.userId)

    const schema = yup.object({
      amount: yup.number().integer().positive().required(),
    })

    schema.validateSync(req.body)
    const body = schema.cast(req.body)

    const inventoryElementCodes = ['paca-360', 'bolsa-360', 'bolsa-reempaque']

    const inventoryElements = await InventoryElements.findAll({
      where: {
        code: {
          [Op.in]: inventoryElementCodes,
        },
      },
    })


    const inventoryElementFrom = inventoryElements.find(e => e.code === 'paca-360')
    const inventoryElementTo = inventoryElements.find(e => e.code === 'bolsa-360')
    const bolsaReempaqueElement = inventoryElements.find(e => e.code === 'bolsa-reempaque')

    if (!inventoryElementFrom)
      throw new Error('No se encontró el elemento de inventario con el código paca-360')

    if (!inventoryElementTo)
      throw new Error('No se encontró el elemento de inventario con el código bolsa-360')

    if (!bolsaReempaqueElement)
      throw new Error('No se encontró el elemento de inventario con el código bolsa-reempaque')


    const storageCodes = ['terminado', 'intermedia']

    const storages = await Storages.findAll({
      where: {
        code: {
          [Op.in]: storageCodes,
        },
      },
    })


    const storageFrom = storages.find(e => e.code === 'terminado')
    const storageTo = storages.find(e => e.code === 'intermedia')

    if (!storageFrom)
      throw new Error('No se encontró el almacen con el código terminado')

    if (!storageTo)
      throw new Error('No se encontró el almacen con el código intermedia')


    const movementData: CreateManualMovementArgs = {
      inventoryElementFromId: inventoryElementFrom.id,
      inventoryElementToId: inventoryElementTo.id,
      storageFromId: storageFrom.id,
      storageToId: storageTo.id,
      quantityFrom: body.amount,
      quantityTo: body.amount * 20,
      cause: 'relocation',
      createdBy: userId,
    }

    const auxMovementData: CreateManualMovementArgs = {
      inventoryElementFromId: bolsaReempaqueElement.id,
      inventoryElementToId: bolsaReempaqueElement.id,
      storageFromId: null,
      storageToId: storageTo.id,
      quantityFrom: body.amount,
      quantityTo: body.amount,
      cause: 'relocation',
      createdBy: userId,
    }

    await sequelize.transaction(async (t) => {
      await createMovement(movementData, t)
      await createMovement(auxMovementData, t)
    })

    res.json({ success: true })

  } catch (err) {
    next(err)
  }
}

export async function relocationMovement(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.userId) {
      const e = Error('User is not logged in')
      e.name = 'user_check_error'
      throw e
    }

    const userId = Number(req.session.userId)

    const schema = yup.object({
      inventoryElementCode: yup.string().required(),
      amount: yup.number().integer().positive().required(),
      counter: yup.number().when('inventoryElementCode', {
        is: 'rollo-360',
        then: schema => schema.integer().positive().required(),
      }),
    })

    schema.validateSync(req.body)
    const body = schema.cast(req.body)

    const elementCode = body.inventoryElementCode

    const inventoryElement = await InventoryElements.findOne({
      where: {
        code: elementCode,
      },
    })

    if (!inventoryElement)
      throw new Error(`No se encontró el elemento de inventario con el código ${elementCode}`)


    const storageCodes = ['bodega', 'trabajo'] as const

    const storages = await Storages.findAll({
      where: {
        code: {
          // The type in @types/sequelize expects a mutable array
          // it doen't actually mutate it
          [Op.in]: storageCodes as Mutable<typeof storageCodes>,
        },
      },
    })

    const storageFrom = storages.find(e => e.code === storageCodes[0])
    const storageTo = storages.find(e => e.code === storageCodes[1])

    if (!storageFrom)
      throw new Error(`No se encontró el almacen con el código ${storageCodes[0]}`)

    if (!storageTo)
      throw new Error(`No se encontró el almacen con el código ${storageCodes[1]}`)


    const movementData: CreateManualMovementArgs = {
      inventoryElementFromId: inventoryElement.id,
      inventoryElementToId: inventoryElement.id,
      storageFromId: storageFrom.id,
      storageToId: storageTo.id,
      quantityFrom: body.amount,
      quantityTo: body.amount,
      cause: 'relocation',
      createdBy: userId,
    }

    const transaction = await sequelize.transaction()

    try {
      await createMovement(movementData, transaction)

      if (elementCode === 'rollo-360') {
        // Remove previous element
        const movementData: CreateManualMovementArgs = {
          inventoryElementFromId: inventoryElement.id,
          inventoryElementToId: inventoryElement.id,
          storageFromId: storageTo.id,
          storageToId: null,
          quantityFrom: body.amount,
          quantityTo: body.amount,
          cause: 'relocation',
          createdBy: userId,
        }

        await createMovement(movementData, transaction)

        // Register machine counter
        await MachineCounters.create({
          value: body.counter!, // Defined when elementCode is 'rollo-360'
          type: 'new-reel',
        }, {
          transaction,
          logging: (sql) => debug('sql:machine-counters')(sql),
        })

      }

      await transaction.commit()
    } catch (err) {
      await transaction.rollback()

      throw err
    }

    res.json({ success: true })

  } catch (err) {
    next(err)
  }
}

export async function entryMovement(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.userId) {
      const e = Error('User is not logged in')
      e.name = 'user_check_error'
      throw e
    }

    const userId = Number(req.session.userId)

    const schema = yup.object({
      inventoryElementCode: yup.string().required(),
      amount: yup.number().integer().positive().required(),
    })

    schema.validateSync(req.body)
    const body = schema.cast(req.body)

    const elementCode = body.inventoryElementCode

    const inventoryElement = await InventoryElements.findOne({
      where: {
        code: elementCode,
      },
    })

    if (!inventoryElement)
      throw new Error(`No se encontró el elemento de inventario con el código ${elementCode}`)


    const storageCode = 'bodega'

    const storageTo = await Storages.findOne({
      where: {
        code: storageCode,
      },
    })

    if (!storageTo)
      throw new Error(`No se encontró el almacen con el código ${storageCode}`)


    const movementData: CreateManualMovementArgs = {
      inventoryElementFromId: inventoryElement.id,
      inventoryElementToId: inventoryElement.id,
      storageFromId: null,
      storageToId: storageTo.id,
      quantityFrom: body.amount,
      quantityTo: body.amount,
      cause: 'in',
      createdBy: userId,
    }

    await createMovement(movementData)

    res.json({ success: true })

  } catch (err) {
    next(err)
  }
}
