import { Request, Response, NextFunction } from 'express'
import models from '../db/models'
import { ClientModel } from '../db/models/clients'

const Clients = models.Clients as ClientModel

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const clients = await Clients.findAll({
      attributes: ['id', 'name', 'code'],
      order: ['code']
    })

    res.json(clients)
  } catch (e) {
    next(e)
  }
}
