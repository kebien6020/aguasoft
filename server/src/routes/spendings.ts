import { Request, Response, NextFunction } from 'express'
import { Op, Includeable } from 'sequelize'
import models from '../db/models'
import { SpendingStatic } from '../db/models/spendings'
import { UserStatic } from '../db/models/users'
import * as moment from 'moment'

const Spendings = models.Spendings as SpendingStatic
const Users = models.Users as UserStatic

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

    const spendings = await Spendings.findAll({
      attributes: [
        'id',
        'date',
        'description',
        'value',
        'fromCash',
        'isTransfer',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ],
      include: [
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

    const totalCount = await Spendings.count()

    res.json({spendings, totalCount})
  } catch (e) {
    next(e)
  }
}

export async function listDay(req: Request, res: Response, next: NextFunction) {
  try {
    const day = moment(req.query.day).startOf('day')
    const spendings = await Spendings.findAll({
      attributes: [
        'id',
        'date',
        'description',
        'value',
        'fromCash',
        'isTransfer',
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
          model: Users,
          attributes: ['name', 'code'],
          paranoid: false,
        } as Includeable,
      ],
      order: [['updatedAt', 'DESC']],
      paranoid: false,
    })

    res.json(spendings)
  } catch (e) {
    next(e)
  }
}

export async function del(req: Request, res: Response, next: NextFunction) {
  try {
    const spendingId = req.params.id
    const spending = await Spendings.findByPk(spendingId)
    await spending.destroy()

    res.json({success: true})
  } catch (e) {
    next(e)
  }
}
