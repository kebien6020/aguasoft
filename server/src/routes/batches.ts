import { Batches, BatchCategories } from '../db/models.js'
import * as yup from 'yup'
import { handleErrors } from '../utils/route.js'
import { Router } from 'ultimate-express'
import { addDays, format } from 'date-fns'
import { ValidationError } from '@sequelize/core'
import { NotFoundError, wrapSync, ok, wrap, time } from './utils.js'
import { getBatchDetail, listBatches, countBatches } from '../db2/batches.js'

const router = Router()
export default router

const listBatchesSchema = yup.object({
  include: yup.array(
    yup.string().oneOf(['BatchCategory']).required(),
  ).notRequired(),
  batchCategoryId: yup.number().integer().notRequired(),
})
router.get('/', wrap(async (req) => {
  const query = listBatchesSchema.validateSync(req.query)

  const batches = await Batches.findAll({
    attributes: ['id', 'code', 'date', 'expirationDate', 'batchCategoryId'],
    include: query.include ?? undefined,
    where: {
      ...(query.batchCategoryId ? { batchCategoryId: query.batchCategoryId } : {}),
    },
    order: [['date', 'DESC']],
  })

  return ok(batches)
}))

const listBatchesPaginatedSchema = yup.object({
  include: yup.array(
    yup.string().oneOf(['BatchCategory']).required(),
  ).notRequired(),
  batchCategoryId: yup.number().integer().notRequired(),
  limit: yup.number().integer().required(),
  offset: yup.number().integer().required(),
})
router.get('/paginated', wrapSync(req => {
  const t1 = time('ValidateQuery')
  const {
    include: includeRaw,
    batchCategoryId: batchCategoryIdRaw,
    limit,
    offset,
  } = listBatchesPaginatedSchema.validateSync(req.query)
  const include = includeRaw ?? []
  const batchCategoryId = batchCategoryIdRaw ?? undefined
  t1()

  const batches = listBatches({ limit, offset, include, batchCategoryId })
  const totalCount = countBatches({ batchCategoryId })

  return ok({
    items: batches,
    totalCount,
  })
}))

router.post('/', handleErrors(async (req, res) => {
  const schema = yup.object({
    date: yup.date().required(),
    batchCategoryId: yup.number().integer().required(),
  })

  schema.validateSync(req.body)
  const body = schema.cast(req.body)

  const category = await BatchCategories.findByPk(body.batchCategoryId)
  if (!category) throw Error('Categoría de lote no encontrada')

  const code = 'L' + format(body.date, 'ddMMyy')
  const expirationDate = addDays(body.date, category.expirationDays)

  try {
    const created = await Batches.create({
      code,
      date: body.date,
      expirationDate,
      batchCategoryId: category.id,
    })
    res.json(created)
  } catch (e: unknown) {
    if (e instanceof ValidationError) {
      throw Error('Ya existe un lote en esta fecha para esta categoría', {
        cause: e,
      })
    }

    throw e
  }

}))


const detailParamSchema = yup.object({
  id: yup.number().required(),
})

router.get('/:id', wrapSync(req => {
  const { id } = detailParamSchema.validateSync(req.params)

  const batch = getBatchDetail(id)
  if (!batch)
    throw new NotFoundError('Lote no encontrado')

  return ok(batch)
}))
