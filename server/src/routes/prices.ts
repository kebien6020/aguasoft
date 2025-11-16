import { Router } from 'ultimate-express'
import { NotFoundError, ok, wrap, wrapSync } from './utils.js'
import * as yup from 'yup'
import {
  listByClientId,
  listByClientIdProductId,
  listByPriceSetId,
  listByPriceSetIdProductId,
} from '../db2/prices.js'
import { time } from '../db2/db.js'
import { getForPriceModeStmt } from '../db2/clients.js'

const router = Router()
export default router

router.get('/:clientId', wrap(async (req) => {
  const clientIdStr = req.params.clientId
  const clientId = Number(clientIdStr)
  const productIdStr = req.query.productId as string | undefined
  const productId = productIdStr ? Number(productIdStr) : undefined

  const t1 = time('GetClient')
  const client = getForPriceModeStmt.get({ id: clientId })
  t1()

  if (!client)
    throw new NotFoundError('Client not found')

  if (client.priceSetId) {
    const priceSetId = client.priceSetId
    const t2 = time('ListPricesByPriceSetId')
    const prices = productId
      ? listByPriceSetIdProductId.all({ priceSetId, productId })
      : listByPriceSetId.all(priceSetId)
    t2()

    return ok(prices)
  }

  const t3 = time('ListPricesByClientId')
  const prices = productId
    ? listByClientIdProductId.all({ clientId, productId })
    : listByClientId.all(clientId)
  t3()

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
