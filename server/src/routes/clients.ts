import { Request, Response, NextFunction } from 'express'
import models from '../db/models'
import { ClientModel } from '../db/models/clients'

const Clients = models.Clients as ClientModel

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const clients = await Clients.findAll({
      attributes: ['id', 'name', 'code', 'defaultCash'],
      order: ['code']
    })

    res.json(clients)
  } catch (e) {
    next(e)
  }
}

export async function defaultsForNew(_req: Request, res: Response, next: NextFunction) {
  try {
    const clients = await Clients.findAll({
      attributes: ['code'],
      order: [['code', 'DESC']],
    })

    // Find first client with a three digit code
    // since the ordering is code DESC, this is the largest
    // three digit code
    const lastCode = clients.find(cl => /\d{3}/.test(cl.code)).code
    console.log(lastCode)

    // Utility pad function
    const pad = (num: string, digits: number, padChar: string  = '0') =>
      num.length >= digits ?
        num :
        new Array(digits - num.length + 1).join(padChar) + num


    const nextCode = pad(String(Number(lastCode) + 1), 3)

    res.json({
      code: nextCode
    })

  } catch (e) {
    next(e)
  }
}
