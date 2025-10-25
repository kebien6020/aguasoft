import { endOfDay, startOfDay } from 'date-fns'
import { Router } from 'ultimate-express'
import { Op } from 'sequelize'
import * as Yup from 'yup'
import {
  Payments,
  Sells,
  Spendings,
} from '../db/models.js'
import { handleErrors } from '../utils/route.js'

const router = Router()
export default router

const validateAndCast = <S>(schema: Yup.Schema<S>, value: unknown): S => {
  schema.validateSync(value)
  return schema.cast(value)
}

router.get('/:date/day-money', handleErrors<{ date: string }>(async (req, res) => {
  const paramsSchema = Yup.object().shape({
    date: Yup.date().required(),
  })

  const { date } = validateAndCast(paramsSchema, req.params)
  const dateWhere = {
    date: {
      [Op.gte]: startOfDay(date),
      [Op.lte]: endOfDay(date),
    },
  } as const

  const cashSaleAmount = await Sells.sum('value', {
    where: {
      date,
      cash: true,
      deleted: false,
    },
  })
  const spendingFromCashAmount = await Spendings.sum('value', {
    where: {
      ...dateWhere,
      fromCash: true,
    },
  })
  const paymentAmount = await Payments.sum('value', {
    where: {
      ...dateWhere,
      directPayment: true,
    },
  })

  res.json({
    success: true,
    cashSaleAmount,
    spendingFromCashAmount,
    paymentAmount,
  })
}))
