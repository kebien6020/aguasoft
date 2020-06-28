import { Request, Response, NextFunction } from 'express'
import * as yup from 'yup'
import models from '../db/models'

const {
  BalanceVerifications,
} = models

export async function createBalanceVerification(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {

    // Validate user logged in
    if (!req.session.userId) {
      const e = Error('User is not logged in')
      e.name = 'user_check_error'
      throw e
    }

    const userId = Number(req.session.userId)

    const schema = yup.object({
      date: yup.date().required(),
      amount: yup.number().required(),
    })

    schema.validateSync(req.body)
    const body = schema.cast(req.body)

    // TODO: Calculate from previous balance vs current amount to verify
    const adjustAmount = 0
    const createdById = userId

    await BalanceVerifications.create({ ...body, adjustAmount, createdById })

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}
