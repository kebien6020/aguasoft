import { endOfDay, startOfDay } from 'date-fns'
import { Request, RequestHandler, Response, Router } from 'express'
import { Params } from 'express-serve-static-core'
import { Op } from 'sequelize'
import * as Yup from 'yup'
import models from '../db/models'

const {
  Payments,
  Sells,
  Spendings,
} = models

const router = Router()
export default router

interface RequestHandlerWithoutNext<P extends Params, ResBody, ReqBody, ReqQuery> {
  (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>): unknown;
}

function handleErrors<
  P extends Params = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = unknown
>(
  handler: RequestHandlerWithoutNext<P, ResBody, ReqBody, ReqQuery>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> {
  return async (req, res, next) => {
    try {
      await handler(req, res)
    } catch (err) {
      next(err)
    }
  }
}

const validateAndCast = <S>(schema: Yup.Schema<S>, value: unknown): S => {
  schema.validateSync(value)
  return schema.cast(value)
}

router.get('/:date/day-money', handleErrors<{date: string}>(async (req, res) => {
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
    },
  })

  res.json({
    success: true,
    cashSaleAmount,
    spendingFromCashAmount,
    paymentAmount,
  })
}))
