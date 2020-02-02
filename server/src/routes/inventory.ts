import { Request, Response, NextFunction } from 'express'
import { InventoryElementStatic } from '../db/models/inventoryElements'
import { InventoryMovement, InventoryMovementStatic } from '../db/models/inventoryMovements'
import { StorageStateStatic } from '../db/models/storageStates'
import { StorageStatic } from '../db/models/storages'
import models, { sequelize } from '../db/models'
import { Op, Transaction } from 'sequelize'
import debug from 'debug'
import * as yup from 'yup'

const InventoryElements = models.InventoryElements as InventoryElementStatic
const InventoryMovements = models.InventoryMovements as InventoryMovementStatic
const StorageStates = models.StorageStates as StorageStateStatic
const Storages = models.Storages as StorageStatic

const logMovement = debug('sql:movements')

interface CreateManualMovementArgs {
  storageFromId: number | null
  storageToId: number | null
  inventoryElementFromId: number
  inventoryElementToId: number
  quantityFrom: number
  quantityTo?: number
  cause: InventoryMovement['cause']
  createdBy: number
}

class MovementError extends Error {}
class NotEnoughInSource extends MovementError {
  name = 'not_enough_in_source'
  message = 'Not enough inventory elements in source storage to perform the movement'
}

async function _createMovementImpl(data: CreateManualMovementArgs, t: Transaction) {
  const opts = (obj = {}) => Object.assign(obj, {
    logging: logMovement,
    transaction: t,
    retry: {
      match: [
        /SQLITE_BUSY/,
      ],
      name: 'query',
      max: 5
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
        throw new NotEnoughInSource()
      }
      previousState.set('quantity', String(newQty))

      await previousState.save({...opts()})
    } else {
      throw new NotEnoughInSource()
    }
  }

  if (data.storageToId) {
    const previousState = await StorageStates.findOne({
      where: { storageId: data.storageToId, inventoryElementId: data.inventoryElementToId },
      ...opts(),
    })

    if (previousState) {
      const oldQty = previousState.get('quantity')
      const newQty = Number(oldQty) + data.quantityTo
      previousState.set('quantity', String(newQty))

      await previousState.save({...opts()})
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
  await InventoryMovements.create(data, {
    fields: [
      'storageFromId',
      'storageToId',
      'inventoryElementFromId',
      'inventoryElementToId',
      'quantityFrom',
      'quantityTo',
      'cause',
      'createdBy',
    ],
    ...opts()
  })
}

async function createMovement(data: CreateManualMovementArgs, transaction?: Transaction) {
  if (!data.quantityTo) data.quantityTo = data.quantityFrom
  if (transaction) {
    return _createMovementImpl(data, transaction)
  }

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

    const movementData : CreateManualMovementArgs = {
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

    res.json({success: true})
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

export async function listStorageStates(_req: Request, res: Response, next: NextFunction) {
  try {
    const storageStates = await StorageStates.findAll()

    res.json(storageStates)
  } catch (e) {
    next(e)
  }
}

export async function listMovements(req: Request, res: Response, next: NextFunction) {
  try {
    const schema = yup.object().noUnknown().shape({
      limit: yup.number(),
      sortField: yup.string(),
      sortDir: yup.string()
        .lowercase()
        .oneOf(['asc', 'desc'])
        .default('asc') as yup.StringSchema<'asc'|'desc'>,
      minDate: yup.date(),
      maxDate: yup.date(),
    })

    schema.validateSync(req.query)
    const query = schema.cast(req.query)

    const where: { createdAt?: {} } = {}
    if (query.minDate) {
      where.createdAt = {...where.createdAt, [Op.gte]: query.minDate}
    }
    if (query.maxDate) {
      where.createdAt = {...where.createdAt, [Op.lte]: query.maxDate}
    }

    const movements = await InventoryMovements.findAll({
      limit: query.limit,
      order: query.sortField ? [[query.sortField, query.sortDir]] : undefined,
      where,
    })

    res.json(movements)
  } catch (e) {
    next(e)
  }
}

type StorageCode = 'bodega' | 'trabajo' | 'intermedia' | 'terminado'
type InventoryElementCode =
    'paca-360'
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

type ProductionType =
    'bolsa-360'
  | 'paca-360'
  | 'bolsa-6l'
  | 'hielo-5kg'
  | 'bolsa-360-congelada'

type Without<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

interface ProductionInfoElement {
  storageFrom: StorageCode | null
  storageTo: StorageCode | null
  inventoryElementFrom: InventoryElementCode
  inventoryElementTo: InventoryElementCode
  damaged: null | Without<ProductionInfoElement, 'damaged'>
}

const productionInfo : {[idx in ProductionType] : ProductionInfoElement} = {
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
  'bolsa-360-congelada': {
    storageFrom: 'intermedia',
    storageTo: 'terminado',
    inventoryElementFrom: 'bolsa-360',
    inventoryElementTo: 'bolsa-360-congelada',
    damaged: null,
  },
}

export async function productionMovement(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.userId) {
      const e = Error('User is not logged in')
      e.name = 'user_check_error'
      throw e
    }

    const userId = Number(req.session.userId)

    const schema = yup.object({
      productionType: yup.mixed<ProductionType>().oneOf(Object.keys(productionInfo) as ProductionType[]).required(),
      amount: yup.number().integer().min(0).required(),
      damaged: yup.mixed().when('productionType', {is: (type: ProductionType) => productionInfo[type].damaged !== null,
        then: yup.number().integer().min(0).required(),
      }),
    })

    schema.validateSync(req.body)
    const body = schema.cast(req.body)

    const pType = body.productionType

    if (
         pType === 'bolsa-360'
      || pType === 'paca-360'
      || pType === 'bolsa-6l'
      || pType === 'hielo-5kg'
    ) {
      const [storages, elements] = await Promise.all([
        Storages.findAll(),
        InventoryElements.findAll(),
      ])
      const storageCodeToId = (code: string) => {
        const storage = storages.find(s => s.code === code)
        return storage ? storage.id : undefined
      }
      const elementCodeToId = (code: string) => {
        const element = elements.find(e => e.code === code)
        return element ? element.id : undefined
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
        cause: 'production' as InventoryMovement['cause'],
        createdBy: userId,
      }

      if (pType === 'paca-360') {
        movementData.quantityFrom = body.amount * 20
      }

      const t = await sequelize.transaction()

      try {
        if (movementData.quantityFrom !== 0 && movementData.quantityTo !== 0) {
          await createMovement(movementData, t)
        }

        if (info.damaged && body.damaged > 0) {
          const storageFromId = storageCodeToId(info.damaged.storageFrom)
          const storageToId = storageCodeToId(info.damaged.storageTo)
          const inventoryElementFromId = elementCodeToId(info.damaged.inventoryElementFrom)
          const inventoryElementToId = elementCodeToId(info.damaged.inventoryElementTo)

          const movementData = {
            storageFromId,
            storageToId,
            inventoryElementFromId,
            inventoryElementToId,
            quantityFrom: body.damaged,
            cause: 'damage' as InventoryMovement['cause'],
            createdBy: userId,
          }

          await createMovement(movementData, t)
        }

        await t.commit();
        res.json({success: true})

      } catch (err) {

        await t.rollback()
        throw err

      }
    } else {
      res.json({
        success: false,
        error: {
          code: 'not_implemented',
          message: 'Tipo de produccion no implementado'
        },
      })
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
      }
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
      }
    })

    res.json({
      'bolsa-360': storageState.quantity,
    })
  } catch (e) {
    next(e)
  }
}
