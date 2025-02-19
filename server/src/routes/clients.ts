import { Request, Response, NextFunction } from 'express'
import { Clients, Prices, Payments, Sells } from '../db/models.js'
import { sequelize } from '../db/sequelize.js'
import moment from 'moment'
import { Moment } from 'moment'
import * as Yup from 'yup'
import { Sequelize } from 'sequelize'


export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schema = Yup.object({
      includeNotes: Yup.string().oneOf(['true', 'false']).default('false').notRequired(),

      // true -> only hidden, false -> only not hidden, not specified -> all
      hidden: Yup.string().oneOf(['hidden', 'not-hidden', 'any']).default('any').notRequired(),
    })

    schema.validateSync(req.query)
    const query = schema.cast(req.query)
    const includeNotes = query.includeNotes as 'true' | 'false'
    const hidden = query.hidden as 'hidden' | 'not-hidden' | 'any'

    const attributes = ['id', 'name', 'code', 'defaultCash', 'hidden']
    if (includeNotes === 'true')
      attributes.push('notes')

    const clients = await Clients.findAll({
      attributes,
      order: [
        Sequelize.literal('CASE WHEN `code` = \'001\' THEN 0 ELSE 1 END'),
        Sequelize.literal('`name` COLLATE NOCASE'),
      ],
      where: {
        ...(hidden !== 'any' && { hidden: hidden === 'hidden' }),
      },
    })

    res.json(clients)
  } catch (e) {
    next(e)
  }
}

export async function defaultsForNew(_req: Request, res: Response, next: NextFunction) {
  try {
    const clients = await Clients.findAll({
      attributes: ['code'],
      order: [['code', 'DESC']],
    })

    // Find first client with a three digit code
    // since the ordering is code DESC, this is the largest
    // three digit code
    const lastCode = clients.find(cl => /\d{3}/.test(cl.code))?.code

    if (!lastCode)
      throw Error('No clients with a three digit code')

    // Utility pad function
    const pad = (num: string, digits: number, padChar = '0') =>
      num.length >= digits
        ? num
        : new Array(digits - num.length + 1).join(padChar) + num


    const nextCode = pad(String(Number(lastCode) + 1), 3)

    res.json({
      code: nextCode,
    })

  } catch (e) {
    next(e)
  }
}

// Throws an error if anything is wrong
function checkCreateEditInput(body: Record<string, unknown>) {
  const paramError = (name: string, reqType: string) => {
    const e = Error(`Param ${name} should be a ${reqType}`)
    e.name = 'parameter_error'
    throw e
  }

  if (typeof body.name !== 'string') paramError('name', 'string')
  if (typeof body.code !== 'string') paramError('code', 'string')
  if (typeof body.defaultCash !== 'boolean') paramError('defaultCash', 'boolean')
  if (typeof body.notes !== 'string') paramError('notes', 'string')
  if (!Array.isArray(body.prices)) paramError('prices', 'array')
  for (const price of body.prices) {
    const allowedKeys = ['name', 'productId', 'value']
    for (const key in price) {
      if (allowedKeys.indexOf(key) === -1)
        delete price[key]

    }
    if (typeof price.name !== 'string') paramError('prices[].name', 'string')
    if (typeof price.productId !== 'number') paramError('prices[].productId', 'number')
    if (typeof price.value !== 'string') paramError('prices[].value', 'string')
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    checkCreateEditInput(req.body)

    const notes = req.body.notes === '' ? null : req.body.notes

    type IncompletePrice =
      Pick<Prices, 'name' | 'productId' | 'value'>

    type IncompleteClient =
      Pick<Clients, 'name' | 'code' | 'defaultCash' | 'notes'>
      & { 'Prices': IncompletePrice[] }

    const client: IncompleteClient = {
      name: req.body.name,
      code: req.body.code,
      defaultCash: req.body.defaultCash,
      notes: notes,
      Prices: req.body.prices,
    }

    await sequelize.transaction(t => {
      return Clients.create(client as any, {
        include: [Prices],
        transaction: t,
      })
    })

    res.json({ success: true })

  } catch (e) {
    next(e)
  }
}

async function getClient(idParam: string, includePrices = false) {
  const id = Number(idParam)

  if (isNaN(id)) {
    const e = Error(':id in the url should be numeric')
    e.name = 'bad_request'
    throw e
  }

  let options = {}
  if (includePrices) {
    options = {
      include: [
        {
          model: Prices,
          attributes: ['name', 'productId', 'value'],
        },
      ],
    }
  }

  const client = await Clients.findByPk(id, options)

  if (!client) {
    const e = Error(`Client with id ${id} doesn't exist in the database`)
    e.name = 'not_found'
    throw e
  }

  return client
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    checkCreateEditInput(req.body)

    const notes = req.body.notes === '' ? null : req.body.notes

    const client = await getClient(req.params.id)

    const newPrices = (req.body.prices as Array<any>).map(pr =>
      Object.assign({}, pr, { clientId: client.id }),
    )

    await sequelize.transaction(async t => {
      // Delete all previous prices
      await Prices.destroy({
        where: {
          clientId: client.id,
        },
        transaction: t,
      })

      // Update attributes
      await client.update({
        name: req.body.name,
        code: req.body.code,
        defaultCash: req.body.defaultCash,
        notes: notes,
      }, { transaction: t })

      // Create new prices
      return Prices.bulkCreate(newPrices, {
        fields: ['name', 'value', 'productId', 'clientId'],
        transaction: t,
      })
    })

    res.json({ success: true })

  } catch (e) {
    next(e)
  }
}

export async function detail(req: Request, res: Response, next: NextFunction) {
  try {
    const client = await getClient(req.params.id, true)

    res.json(client)

  } catch (e) {
    next(e)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const client = await getClient(req.params.id)

    await sequelize.transaction(async t => {
      // FK constraint should remove all prices but let's not
      // rely on it, (if by an offchance it casuses problems
      // in the future and has to be disabled)
      await Prices.destroy({
        where: {
          clientId: client.id,
        },
        transaction: t,
      })

      // Actually remove client
      return client.destroy({ transaction: t })
    })

    res.json({ success: true })
  } catch (e) {
    next(e)
  }
}

export async function hide(req: Request, res: Response, next: NextFunction) {
  try {
    const client = await getClient(req.params.id)

    await client.update({ hidden: true })

    res.json({ success: true })
  } catch (e) {
    next(e)
  }
}

export async function unhide(req: Request, res: Response, next: NextFunction) {
  try {
    const client = await getClient(req.params.id)

    await client.update({ hidden: false })

    res.json({ success: true })
  } catch (e) {
    next(e)
  }
}

export async function balance(req: Request, res: Response, next: NextFunction) {
  try {
    const client = await getClient(req.params.id)

    const payments = await Payments.findAll({
      where: {
        clientId: client.id,
      },
    })

    const sells = await Sells.findAll({
      where: {
        clientId: client.id,
        deleted: false,
        cash: false,
      },
    })

    interface Change {
      date: Moment
      value: number
      type: 'sell' | 'payment'
    }

    const changes: Array<Change> = []
      .concat(sells.map(s => ({
        date: moment(s.date),
        value: Number(s.value),
        type: 'sell',
        id: s.id,
      })))
      .concat(payments.map(p => ({
        date: moment(p.date),
        value: Number(p.value),
        type: 'payment',
        id: p.id,
      })))
      .sort((a: Change, b: Change) => a.date.valueOf() - b.date.valueOf())

    res.json({ changes })
  } catch (e) {
    next(e)
  }
}
