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
    const firstVerificationEver = await BalanceVerifications.findOne({
      order: [['date', 'asc']],
    })

    if (!firstVerificationEver) throw new NoVerifications()

    const schema = yup.object({
      minDate: yup.date().notRequired(),
      maxDate: yup.date().notRequired(),
    })

    schema.validateSync(req.query)
    const { minDate, maxDate } = schema.cast(req.query)

    let firstVerification = firstVerificationEver
    if (minDate && moment(minDate).isAfter(firstVerificationEver.date, 'day')) {
      // Most recent verification before minDate
      const closestVerification = await BalanceVerifications.findOne({
        where: {
          date: {
            [Op.gte]: minDate,
          },
        },
        order: [['date', 'desc']],
      })

      if (closestVerification) firstVerification = closestVerification
    }

    // Sales
    type DaySale = {
      valueSum: number
      date: string
    }

    const maxDateWhere = maxDate ? { [Op.lte]: maxDate } : {}

    const groupedSales = await Sells.findAll({
      attributes: [
        [Sequelize.fn('sum', Sequelize.col('value')), 'valueSum'],
        'date',
      ],
      where: {
        date: {
          [Op.gte]: firstVerification.date,
          ...maxDateWhere,
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
        {
          [Op.gte]: firstVerification.date,
          ...maxDateWhere,
        }
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
          {
            [Op.gte]: firstVerification.date,
            ...maxDateWhere,
          }
        ),
      },
      group: Sequelize.fn('date', Sequelize.col('date')),
      raw: true,
    }) as unknown as DayPayments[]

    // The rest of verifications
    // Verifications are not grouped because there is a guarantee of maximum a
    // verification per day (date is unique and DATEONLY)
    const verifications = await BalanceVerifications.findAll({
      where: {
        date: {
          [Op.gte]: firstVerification.date,
          ...maxDateWhere,
        },
      },
    })

    const today = moment().startOf('day')
    const days = enumerateDaysBetweenDates(firstVerification.date, today)

    const balances = days.map(day => {
      const dayStr = day.format('YYYY-MM-DD')
      const daySales = groupedSales.find(daySales => daySales.date === dayStr)
      const daySpendings = groupedSpendings.find(daySpendings => daySpendings.date === dayStr)
      const dayPayments = groupedPayments.find(dayPayments => dayPayments.date === dayStr)
      const verification = verifications.find(verification => verification.date === dayStr)

      return {
        date: dayStr,
        sales: daySales?.valueSum ?? 0,
        spendings: daySpendings?.valueSum ?? 0,
        payments: dayPayments?.valueSum ?? 0,
        verification,
      }
    })

    // Calculate balance each day

    let dayBalance = firstVerification.amount
    let calcBalances = balances.map(dayInfo => {
      // A verification amount corresponds to the starting value of the day
      if (dayInfo.verification?.amount)
        dayBalance = dayInfo.verification.amount

      dayBalance += dayInfo.sales + dayInfo.payments - dayInfo.spendings
      return { ...dayInfo, balance: dayBalance }
    })


    // filter by date
    if (minDate) {
      calcBalances = calcBalances
        .filter(balance => moment(balance.date).isSameOrAfter(minDate, 'day'))
    }

    if (maxDate) {
      calcBalances = calcBalances
        .filter(balance => moment(balance.date).isSameOrBefore(maxDate, 'day'))
    }

    res.json({ success: true, data: calcBalances })
  } catch (err) {
    next(err)
  }
}
