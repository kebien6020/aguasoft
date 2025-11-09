import { Router } from 'ultimate-express'
import { NotFoundError, ok, requireAdmin, wrapSync } from './utils.js'
import * as yup from 'yup'
import { db, time } from '../db2/db.js'
import {
  insert as insertStmt,
  list as listStmt,
  detail as detailStmt,
  updateName as updateNameStmt,
  softDelete as softDeleteStmt,
  PriceSetCompact,
} from '../db2/priceSets.js'
import {
  insert as insertPriceStmt,
  listByPriceSetId as listPricesByPriceSetIdStmt,
  deletePricesForPriceSet as deletePricesForPriceSetStmt,
  PriceCompact,
} from '../db2/prices.js'

const router = Router()
export default router

const createSchema = yup.object({
  name: yup.string().required(),
  prices: yup.array(
    yup.object({
      name: yup.string().required(),
      productId: yup.string().required(),
      value: yup.number().required().min(0),
    }).required(),
  ).required(),
})

router.post('/', wrapSync((req) => {
  requireAdmin(req)
  const { name, prices } = createSchema.validateSync(req.body)

  const createdAt = new Date().toISOString()
  const updatedAt = createdAt

  const t1 = time('InsertPriceSet')
  const { lastInsertRowid: id } = insertStmt.run({ name, createdAt, updatedAt })
  t1()

  const t2 = time('InsertPrices')
  db.transaction((prices) => {
    for (const price of prices) {
      insertPriceStmt.run({
        name: price.name,
        clientId: null,
        productId: price.productId,
        value: price.value,
        priceSetId: id,
        createdAt,
        updatedAt,
      })
    }
  })(prices)
  t2()

  return ok({ id })
}))

router.get('/', wrapSync((_req) => {
  const t = time('ListPriceSets')
  const priceSets = listStmt.all()
  t()

  return ok({ items: priceSets })
}))

const detailParamsSchema = yup.object({
  id: yup.string().required(),
})

const detailsQuerySchema = yup.object({
  include: yup.array().of(
    yup.string().oneOf(['prices']),
  ).default([]),
})

type DetailPayload = PriceSetCompact & {
  prices?: PriceCompact[]
}

router.get('/:id', wrapSync((req) => {
  const { id } = detailParamsSchema.validateSync(req.params)
  const { include } = detailsQuerySchema.validateSync(req.query)

  const t = time('PriceSetDetail')
  const priceSet = detailStmt.get({ id })
  t()

  if (!priceSet)
    throw new NotFoundError('Conjunto de precios no encontrado')

  const payload: DetailPayload = priceSet

  if (include.includes('prices')) {
    const t = time('PriceSetPrices')
    const prices = listPricesByPriceSetIdStmt.all(id)
    t()
    payload.prices = prices
  }

  return ok(payload)
}))

router.post('/:id', wrapSync((req) => {
  requireAdmin(req)
  const { id } = detailParamsSchema.validateSync(req.params)
  const { name, prices } = createSchema.validateSync(req.body)

  const updatedAt = new Date().toISOString()

  db.transaction(() => {
    const t1 = time('UpdatePriceSetName')
    const { changes } = updateNameStmt.run({ id, name, updatedAt })
    t1()
    if (changes === 0)
      throw new NotFoundError('Conjunto de precios no encontrado')

    const t2 = time('DeleteOldPrices')
    deletePricesForPriceSetStmt.run({ priceSetId: id })
    t2()
    const t3 = time('InsertNewPrices')
    for (const price of prices) {
      insertPriceStmt.run({
        name: price.name,
        clientId: null,
        productId: price.productId,
        value: price.value,
        priceSetId: id,
        createdAt: updatedAt,
        updatedAt,
      })
    }
    t3()
  })()

  return ok({})
}))

router.delete('/:id', wrapSync((req) => {
  requireAdmin(req)
  const { id } = detailParamsSchema.validateSync(req.params)
  const deletedAt = new Date().toISOString()

  const t = time('DeletePriceSet')
  const { changes } = softDeleteStmt.run({ id, deletedAt })
  t()

  if (changes === 0)
    throw new NotFoundError('Conjunto de precios no encontrado')

  return ok({})
}))
