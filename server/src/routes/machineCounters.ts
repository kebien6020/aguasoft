import { Request, Response, NextFunction } from 'express'
import { MachineCounterStatic } from '../db/models/machineCounters'
import models from '../db/models'

const MachineCounters = models.MachineCounters as MachineCounterStatic

export async function mostRecentProduction(_req: Request, res: Response, next: NextFunction) {
  try {
    const counter = await MachineCounters.findOne({
      where: { type: 'production' },
      order: [['createdAt', 'desc']]
    })

    if (!counter) throw Error('No hay contadores registrados, el primer contador se debe registar manualmente en la base de datos')

    res.json(counter)
  } catch (err) {
    next(err)
  }
}
