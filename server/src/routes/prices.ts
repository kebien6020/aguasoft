import { Router } from 'ultimate-express'
import { Prices } from '../db/models.js'
import { ok, wrap, wrapSync } from './utils.js'
import * as yup from 'yup'
import { listByPriceSetId } from '../db2/prices.js'
import { time } from '../db2/db.js'

const router = Router()
export default router

router.get('/:clientId', wrap(async (req) => {
  const clientId = req.params.clientId
  const productId = req.query.productId as string | undefined

  const prices = await Prices.findAll({
    attributes: ['id', 'value', 'productId', 'name'],
    where: {
      clientId: clientId,
      ...(productId ? { productId: productId } : {}),
    },
  })

  return ok(prices)
}))

const priceSetParamsSchema = yup.object({
  priceSetId: yup.string().required(),
})
router.get('/priceSet/:priceSetId', wrapSync(req => {
  const t1 = time('ValidateParams')
  const { priceSetId } = priceSetParamsSchema.validateSync(req.params)
  t1()

  const t2 = time('ListPrices')
  const prices = listByPriceSetId.all(priceSetId)
  t2()

  return ok(prices)
}))
