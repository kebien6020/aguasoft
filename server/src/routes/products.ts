import { Request, Response, NextFunction } from 'express'
import models from '../db/models'

const Products = models.Products

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const products = await Products.findAll({
      attributes: ['id', 'name', 'code', 'basePrice']
    })

    res.json(products)
  } catch (e) {
    next(e)
  }
}
