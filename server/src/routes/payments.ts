import { Request, Response, NextFunction } from 'express'
import { Op, Includeable } from 'sequelize'
import models from '../db/models'
import { PaymentStatic } from '../db/models/payments'
import { UserStatic } from '../db/models/users'
import * as moment from 'moment'

const Payments = models.Payments as PaymentStatic
const Users = models.Users as UserStatic

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body

    if (!req.session.userId) {
      const e = Error('User is not logged in')
      e.name = 'user_check_error'
      throw e
    }

    const user = await Users.findByPk(req.session.userId)

    if (user.role !== 'admin') {
      body.directPayment = false
    }

    body.userId = req.session.userId
    body.date = moment().toISOString()

    // Normalize dates
    if (body.dateFrom) {
      body.dateFrom = moment(body.dateFrom).format('YYYY-MM-DD')
    }

    if (body.dateTo) {
      body.dateTo = moment(body.dateTo).format('YYYY-MM-DD')
    }

    await Payments.create(body, {
      // Only allow user input to control these attributes
      fields: [
        'value',
        'clientId',
        'userId',
        'date',
        'dateFrom',
        'dateTo',
        'invoiceNo',
        'invoiceDate',
        'directPayment'
      ],
    })

    res.json({success: true})
  } catch (e) {
    next(e)
  }
}

export async function listDay(req: Request, res: Response, next: NextFunction) {
  try {
    const day = moment(req.query.day).startOf('day')
    const payments = await Payments.findAll({
      attributes: [
        'id',
        'value',
        'date',
        'dateFrom',
        'dateTo',
        'invoiceNo',
        'invoiceDate',
        'directPayment',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ],
      where: {
        date: {
          [Op.gte]: day.toISOString(),
          [Op.lt]: day.add(1, 'day').toISOString(),
        }
      },
      include: [
        {
          model: models.Clients,
          attributes: ['name', 'id'],
        },
        {
          model: models.Users,
          attributes: ['name', 'code'],
          paranoid: false,
        } as Includeable,
      ],
      order: [['updatedAt', 'DESC']],
      paranoid: false,
    })

    res.json(payments)
  } catch (e) {
    next(e)
  }
}

export async function listRecent(req: Request, res: Response, next: NextFunction) {
  try {
    const amount = req.params.amount || 3
    const payments = await Payments.findAll({
      attributes: [
        'id',
        'value',
        'date',
        'dateFrom',
        'dateTo',
        'invoiceNo',
        'invoiceDate',
        'directPayment',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ],
      order: [['updatedAt', 'DESC']],
      include: [
        {
          model: models.Clients,
          attributes: ['name', 'id'],
        },
        {
          model: models.Users,
          attributes: ['name', 'code'],
          paranoid: false,
        } as Includeable,
      ],
      paranoid: false,
      limit: amount,
    })

    res.json(payments)
  } catch (e) {
    next(e)
  }
}

export async function del(req: Request, res: Response, next: NextFunction) {
  try {
    const paymentId = req.params.id
    const payment = await Payments.findByPk(paymentId)
    await payment.destroy()

    res.json({success: true})
  } catch (e) {
    next(e)
  }
}
