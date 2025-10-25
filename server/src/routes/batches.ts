import { Batches, BatchCategories } from '../db/models.js'
import * as yup from 'yup'
import { handleErrors } from '../utils/route.js'
import { Router } from 'ultimate-express'
import { addDays, format } from 'date-fns'
import { ValidationError } from 'sequelize'

const router = Router()
export default router

router.get('/', handleErrors(async (req, res) => {
  const includeOptions = ['BatchCategory']
  const schema = yup.object({
    include: yup.array(
      yup.string().oneOf(includeOptions).required(),
    ).notRequired(),
    batchCategoryId: yup.number().integer().notRequired(),
  })

  schema.validateSync(req.query)
  const query = schema.cast(req.query)

  const batches = await Batches.findAll({
    attributes: ['id', 'code', 'date', 'expirationDate', 'batchCategoryId'],
    include: query.include ?? undefined,
    where: {
      ...(query.batchCategoryId ? { batchCategoryId: query.batchCategoryId } : {}),
    },
    order: [['date', 'DESC']],
  })

  res.json(batches)
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
    if (e instanceof ValidationError)
      throw Error('Ya existe un lote en esta fecha para esta categoría')

    throw e
  }

}))
