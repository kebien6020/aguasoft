import { Request, Response, NextFunction } from 'express'
import { InventoryElementStatic } from '../db/models/inventoryElements'
import { InventoryMovement, InventoryMovementStatic } from '../db/models/inventoryMovements'
import { StorageStateStatic } from '../db/models/storageStates'
import { StorageStatic } from '../db/models/storages'
import models, { sequelize } from '../db/models'
import debug from 'debug'

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

async function createMovement(data: CreateManualMovementArgs) {
  if (!data.quantityTo) data.quantityTo = data.quantityFrom
  await sequelize.transaction(async (t) => {
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
        where: { storageId: data.storageFromId },
        ...opts(),
      })

      if (previousState) {
        const oldQty = previousState.get('quantity')
        const newQty = Number(oldQty) - data.quantityFrom
        if (newQty < 0) {
          throw new NotEnoughInSource();
        }
        previousState.set('quantity', String(newQty))

        await previousState.save({...opts()})
      } else {
        throw new NotEnoughInSource();
      }
    }

    if (data.storageToId) {
      const previousState = await StorageStates.findOne({
        where: { storageId: data.storageToId },
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
    const storages = await Storages.findAll();

    res.json(storages)
  } catch (e) {
    next(e)
  }
}

export async function listInventoryElements(_req: Request, res: Response, next: NextFunction) {
  try {
    const inventoryElements = await InventoryElements.findAll();

    res.json(inventoryElements)
  } catch (e) {
    next(e)
  }
}
