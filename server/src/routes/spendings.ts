import { Request, Response, NextFunction } from 'express'
import { Op, Includeable } from 'sequelize'
import { Spendings, Users } from '../db/models.js'
import { parseDateonly } from '../utils/date.js'
import { addDays, startOfDay } from 'date-fns'

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body

    if (!req.session.userId) {
      const e = Error('User is not logged in')
      e.name = 'user_check_error'
      throw e
    }

    const user = await Users.findByPk(req.session.userId)
    if (!user) throw Error('User not found')

    if (user.role !== 'admin')
      body.date = (new Date).toISOString()


    body.userId = req.session.userId

    await Spendings.create(body, {
      // Only allow user input to control these attributes
      fields: [
        'description',
        'value',
        'userId',
        'date',
        'fromCash',
        'isTransfer',
      ],
    })

    res.json({ success: true })
  } catch (e) {
    next(e)
  }
}

export async function paginate(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = Number(req.query.limit)
    const offset = Number(req.query.offset)

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
          model: Users,
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

    res.json({ spendings, totalCount })
  } catch (e) {
    next(e)
  }
}

export async function listDay(req: Request, res: Response, next: NextFunction) {
  try {
    const dayInput = typeof req.query.day === 'string' ? req.query.day : undefined
    if (!dayInput)
      throw Error('day query parameter is required')

    const day = startOfDay(parseDateonly(dayInput))
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
          [Op.lt]: addDays(day, 1).toISOString(),
        },
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

export async function listRecent(req: Request, res: Response, next: NextFunction) {
  try {
    const amount = Number(req.query.amount) || 3
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
      order: [['date', 'DESC'], ['updatedAt', 'DESC']],
      include: [
        {
          model: Users,
          attributes: ['name', 'code'],
          paranoid: false,
        } as Includeable,
      ],
      paranoid: false,
      limit: amount,
    })

    res.json(spendings)
  } catch (e) {
    next(e)
  }
}

export async function del(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session.userId) {
      const e = Error('Debes iniciar sesión para eliminar salidas')
      e.name = 'user_check_error'
      throw e
    }

    const userId = req.session.userId
    const user = await Users.findByPk(userId)
    if (!user) throw Error('User not found')
    if (user.role !== 'admin') {
      const e = new Error('Solo usuarios admin pueden eliminar salidas')
      e.name = 'user_permission'
      throw e
    }

    const spendingId = req.params.id
    const spending = await Spendings.findByPk(spendingId)
    if (!spending) throw new Error('Salida no encontrada')

    await spending.destroy()

    res.json({ success: true })
  } catch (e) {
    next(e)
  }
}
