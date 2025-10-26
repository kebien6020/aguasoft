import { Request, Response, NextFunction } from 'ultimate-express'
import { MachineCounters } from '../db/models.js'

export async function mostRecentProduction(_req: Request, res: Response, next: NextFunction) {
  try {
    const counter = await MachineCounters.findOne({
      where: { type: 'production' },
      order: [['createdAt', 'desc']],
    })

    if (!counter) throw Error('No hay contadores registrados, el primer contador se debe registar manualmente en la base de datos')

    res.json(counter)
  } catch (err) {
    next(err)
  }
}

export async function mostRecentNewReel(_req: Request, res: Response, next: NextFunction) {
  try {
    const counter = await MachineCounters.findOne({
      where: { type: 'new-reel' },
      order: [['createdAt', 'desc']],
    })

    if (!counter) throw Error('No hay contadores registrados, el primer contador se debe registar manualmente en la base de datos')

    res.json(counter)
  } catch (err) {
    next(err)
  }
}
