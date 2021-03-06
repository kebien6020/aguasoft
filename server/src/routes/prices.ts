import { Request, Response, NextFunction } from 'express'
import models from '../db/models'
import { PriceStatic } from '../db/models/prices'

const Prices = models.Prices as PriceStatic

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = req.params.clientId as string
    const prices = await Prices.findAll({
      attributes: ['id', 'value', 'productId', 'name'],
      where: {clientId: clientId},
    })

    res.json(prices)
  } catch (e) {
    next(e)
  }
}
