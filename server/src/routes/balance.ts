import { Request, Response, NextFunction } from 'express'
import * as yup from 'yup'
import models from '../db/models'
import { enumerateDaysBetweenDates } from '../utils/date'
import * as moment from 'moment'
import { Op, Sequelize } from 'sequelize'

const {
  BalanceVerifications,
  Payments,
  Sells,
  Spendings,
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

class NoVerifications extends Error {
  name = 'no_verifications'
  message =
      'No hay ninguna verificacion de balance registrada, al menos una es'
    + 'requerida'
}

// List balance from either the specified date or the first verification
export async function listBalance(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const verification = await BalanceVerifications.findOne({
      order: [['date', 'asc']],
    })

    if (!verification) throw new NoVerifications()

    // Sales
    type DaySale = {
      valueSum: number
      date: string
    }

    const groupedSales = await Sells.findAll({
      attributes: [
        [Sequelize.fn('sum', Sequelize.col('value')), 'valueSum'],
        'date',
      ],
      where: {
        date: {
          [Op.gte]: verification.date,
        },
      },
      group: 'date',
      raw: true,
    }) as unknown as DaySale[]

    // Spendings
    type DaySpendings = {
      valueSum: number,
      date: string
    }

    const groupedSpendings = await Spendings.findAll({
      attributes: [
        [Sequelize.fn('sum', Sequelize.col('value')), 'valueSum'],
        [Sequelize.fn('date', Sequelize.col('date')), 'date'],
      ],
      where: Sequelize.where(
        Sequelize.fn('date', Sequelize.col('date')),
        { [Op.gte]: verification.date }
      ),
      group: Sequelize.fn('date', Sequelize.col('date')),
      raw: true,
    }) as unknown as DaySpendings[]

    // Payments
    type DayPayments = {
      valueSum: number,
      date: string
    }

    const groupedPayments = await Payments.findAll({
      attributes: [
        [Sequelize.fn('sum', Sequelize.col('value')), 'valueSum'],
        [Sequelize.fn('date', Sequelize.col('date')), 'date'],
      ],
      where: {
        directPayment: true,
        [Op.and]: Sequelize.where(
          Sequelize.fn('date', Sequelize.col('date')),
          { [Op.gte]: verification.date }
        ),
      },
      group: Sequelize.fn('date', Sequelize.col('date')),
      raw: true,
    }) as unknown as DayPayments[]

    const today = moment().startOf('day')
    const days = enumerateDaysBetweenDates(verification.date, today)

    const balances = days.map(day => {
      const dayStr = day.format('YYYY-MM-DD')
      const daySales = groupedSales.find(daySales => daySales.date === dayStr)
      const daySpendings = groupedSpendings.find(daySpendings => daySpendings.date === dayStr)
      const dayPayments = groupedPayments.find(dayPayments => dayPayments.date === dayStr)

      return {
        date: dayStr,
        sales: daySales?.valueSum ?? 0,
        spendings: daySpendings?.valueSum ?? 0,
        payments: dayPayments?.valueSum ?? 0,
      }
    })

    res.json({ success: true, data: balances, groupedSales })
  } catch (err) {
    next(err)
  }
}
