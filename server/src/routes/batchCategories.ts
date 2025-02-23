import { BatchCategories } from '../db/models.js'
import * as yup from 'yup'
import { handleErrors } from '../utils/route.js'
import { Router } from 'express'
import { Error404 } from '../errors.js'

const router = Router()
export default router

router.get('/', handleErrors(async (req, res) => {
  const schema = yup.object({})

  schema.validateSync(req.query)

  const batchCategories = await BatchCategories.findAll({
    attributes: ['id', 'name', 'code', 'expirationDays'],
  })

  res.json(batchCategories)
}))

router.get('/:id', handleErrors(async (req, res) => {
  const schema = yup.object({
    id: yup.number().required(),
  })

  schema.validateSync(req.params)

  const { id } = req.params

  const batchCategory = await BatchCategories.findByPk(id)

  if (batchCategory === null)
    throw new Error404('Categoria de lote no encontrada')

  res.json(batchCategory)
}))
