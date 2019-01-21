import { Request, Response, NextFunction } from 'express'
import models from '../db/models'
import { ClientModel, ClientAttributes } from '../db/models/clients'
import { PriceModel, PriceAttributes } from '../db/models/prices'
import { sequelize } from '../db/models'

const Clients = models.Clients as ClientModel
const Prices = models.Prices as PriceModel

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

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const paramError = (name: string, reqType: string) => {
      const e = Error(`Param ${name} should be a ${reqType}`)
      e.name = 'parameter_error'
      throw e
    }

    if (typeof req.body.name !== 'string') paramError('name', 'string')
    if (typeof req.body.code !== 'string') paramError('code', 'string')
    if (typeof req.body.defaultCash !== 'boolean') paramError('defaultCash', 'boolean')
    if (!Array.isArray(req.body.prices)) paramError('prices', 'array')
    for (const price of req.body.prices) {
      if (typeof price.name !== 'string') paramError('prices[].name', 'string')
      if (typeof price.productId !== 'number') paramError('prices[].productId', 'number')
      if (typeof price.value !== 'string') paramError('prices[].value', 'string')
    }

    type IncompletePrice =
      Pick<PriceAttributes, 'name' | 'productId' | 'value'>

    type IncompleteClient =
      Pick<ClientAttributes, 'name' | 'code' | 'defaultCash'>
      & { 'Prices': IncompletePrice[] }

    const client : IncompleteClient = {
      name: req.body.name,
      code: req.body.code,
      defaultCash: req.body.defaultCash,
      'Prices': req.body.prices
    }

    await sequelize.transaction(t => {
      return Clients.create(client as any, {
        include: [Prices],
        transaction: t
      })
    })

    res.json({success: true})

  } catch (e) {
    next(e)
  }
}

export async function detail(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)

    if (isNaN(id)) {
      const e = Error(':id in the url should be numeric')
      e.name = 'bad_request'
      throw e
    }

    const client = await Clients.findByPk(id, {
      include: [{
        model: Prices,
        attributes: ['name', 'productId', 'value'],
      }]
    })
    if (!client) {
      const e = Error(`Client with id ${id} doesn't exist in the database`)
      e.name = 'not_found'
      throw e
    }

    res.json(client)

  } catch (e) {
    next(e)
  }
}
