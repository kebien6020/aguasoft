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
      body.directPayment = true
      body.date = moment().toISOString()
    }

    body.userId = req.session.userId

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

export async function paginate(req: Request, res: Response, next: NextFunction) {
  try {
    let limit = Number(req.query.limit)
    let offset = Number(req.query.offset)

    if (isNaN(limit)) {
      const e = Error('limit should be a number')
      e.name = 'bad_request'
      throw e
    }

    if (isNaN(offset)) {
      const e = Error('offset should be a number')
      e.name = 'bad_request'
      throw e
    }

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
      order: [['date', 'DESC'], ['updatedAt', 'DESC']],
      paranoid: false,
      limit: limit,
      offset: offset,
    })

    const totalCount = await Payments.count()

    res.json({payments, totalCount})
  } catch (e) {
    next(e)
  }
}

export async function listDay(req: Request, res: Response, next: NextFunction) {
  try {
    const dayInput = typeof req.query.day === 'string' ? req.query.day : undefined
    const day = moment(dayInput).startOf('day')
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
    const amount = Number(req.query.amount) || 3
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
      order: [['date', 'DESC'], ['updatedAt', 'DESC']],
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
