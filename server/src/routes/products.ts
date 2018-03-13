import { Request, Response, NextFunction } from 'express'
import models from '../db/models'
import { ProductModel } from '../db/models/products'

const Products = models.Products as ProductModel

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
