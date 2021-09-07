import { Request, Response, NextFunction } from 'express'
import models from '../db/models'
import * as yup from 'yup'

const { Products } = models

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const includeOptions = ['Variants']
    const schema = yup.object({
      include: yup.array(
        yup.string().oneOf(includeOptions)
      ).notRequired(),
    })

    schema.validateSync(req.query)
    const query = schema.cast(req.query)

    const products = await Products.findAll({
      attributes: ['id', 'name', 'code', 'basePrice'],
      include: query.include,
    })

    res.json(products)
  } catch (e) {
    next(e)
  }
}
