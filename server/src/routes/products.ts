import { Request, Response, NextFunction } from 'ultimate-express'
import { Products } from '../db/models.js'
import * as yup from 'yup'

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const includeOptions = ['Variants']
    const schema = yup.object({
      include: yup.array(
        yup.string().oneOf(includeOptions).required(),
      ).notRequired(),
    })

    schema.validateSync(req.query)
    const query = schema.cast(req.query)

    const products = await Products.findAll({
      attributes: ['id', 'name', 'code', 'basePrice', 'batchCategoryId'],
      include: query.include ?? undefined,
    })

    res.json(products)
  } catch (e) {
    next(e)
  }
}
