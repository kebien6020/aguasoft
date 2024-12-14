import { Request, Response, NextFunction } from 'express'
import models from '../db/models'

const Prices = models.Prices

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const clientId = req.params.clientId
    const productId = req.query.productId as string | undefined

    const prices = await Prices.findAll({
      attributes: ['id', 'value', 'productId', 'name'],
      where: {
        clientId: clientId,
        ...(productId ? { productId: productId } : {}),
      },
    })

    res.json(prices)
  } catch (e) {
    next(e)
  }
}
