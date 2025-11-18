import { Request, Response, NextFunction } from 'ultimate-express'
import { Clients, Prices, Payments, Sells, ClientBalances } from '../db/models.js'
import { sequelize } from '../db/sequelize.js'
import * as Yup from 'yup'
import { type CreationAttributes, type Order, Sequelize } from 'sequelize'
import { formatDateonly } from '../utils/date.js'
import { ok, time, wrap, wrapSync } from './utils.js'
import { listClientsStmt } from '../db2/clients.js'


const listSchema = Yup.object({
  includeNotes: Yup.string().oneOf(['true', 'false']).default('false').notRequired(),
  hidden: Yup.string().oneOf(['hidden', 'not-hidden', 'any']).default('any').notRequired().nonNullable(),
  priceSetId: Yup.number().notRequired().nonNullable(),
  search: Yup.string().notRequired().nonNullable(),
})

const hiddenLookup = {
  hidden: 1,
  'not-hidden': 0,
  any: undefined,
} as const

export const list = wrapSync(req => {
  const t1 = time('ValidateInput')
  const query = listSchema.validateSync(req.query)
  const {
    includeNotes: includeNotesStr,
    hidden: hiddenStr,
    priceSetId,
    search,
  } = query
  const includeNotes = includeNotesStr === 'true'
  const hidden = hiddenLookup[hiddenStr]
  t1()

  const t2 = time('ListClients')
  const dbClients = listClientsStmt.all({
    hidden,
    priceSetId,
    search,
  })
  t2()

  const t3 = time('FormatClients')
  const clients = dbClients.map(cl => ({
    id: cl.id,
    name: cl.name,
    code: cl.code,
    defaultCash: Boolean(cl.defaultCash),
    hidden: Boolean(cl.hidden),
    ...(includeNotes ? { notes: cl.notes } : {}),
    priceSetId: cl.priceSetId,
  }))
  t3()

  return ok(clients)
})

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

  if (body.priceSetId !== undefined && body.priceSetId !== null) {
    if (typeof body.priceSetId !== 'number') paramError('priceSetId', 'number')
    if ((body.prices as unknown[]).length !== 0) {
      const e = Error('If priceSetId is provided, prices array must be empty')
      e.name = 'parameter_error'
      throw e
    }
  }

  for (const price of body.prices as Array<CreationAttributes<Prices>>) {
    const sPrice = { // Sanitized price
      name: price.name,
      productId: price.productId,
      value: price.value,
    }
    if (typeof sPrice.name !== 'string') paramError('prices[].name', 'string')
    if (typeof sPrice.productId !== 'number') paramError('prices[].productId', 'number')
    if (typeof sPrice.value !== 'string') paramError('prices[].value', 'string')

    if (Object.keys(sPrice).length !== Object.keys(price).length) {
      const e = Error('Extra keys in prices object')
      e.name = 'parameter_error'
      throw e
    }
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    checkCreateEditInput(req.body)

    const notes = req.body.notes === '' ? null : req.body.notes

    type IncompletePrice =
      Pick<Prices, 'name' | 'productId' | 'value'>

    type IncompleteClient =
      Pick<Clients, 'name' | 'code' | 'defaultCash' | 'notes' | 'hidden' | 'priceSetId'>
      & { 'Prices': IncompletePrice[] }

    const client: IncompleteClient = {
      name: req.body.name,
      code: req.body.code,
      defaultCash: req.body.defaultCash,
      notes: notes,
      priceSetId: req.body.priceSetId ?? null,
      Prices: req.body.prices,
      hidden: false,
    }

    await sequelize.transaction(t => {
      return Clients.create(client, {
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

    const newPrices = (req.body.prices as Array<CreationAttributes<Prices>>).map(pr =>
      ({ ...pr, clientId: client.id }),
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
        priceSetId: req.body.priceSetId ?? null,
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
      date: string
      value: number
      type: 'sell' | 'payment'
    }

    const changes = ([] as Change[])
      .concat(sells.map(s => ({
        date: s.date,
        value: Number(s.value),
        type: 'sell',
        id: s.id,
      })))
      .concat(payments.map(p => ({
        date: formatDateonly(p.date),
        value: Number(p.value),
        type: 'payment',
        id: p.id,
      })))
      .sort((a: Change, b: Change) => a.date < b.date ? -1 : 1)

    res.json({ changes })
  } catch (e) {
    next(e)
  }
}

const clientBalancesSchema = Yup.object({
  sortBy: Yup.string().oneOf(['clientName', 'balance', 'lastSaleDate']).default('balance'),
  sortDir: Yup.string().oneOf(['asc', 'desc']).default('desc'),
  include: Yup.array().of(
    Yup.string().oneOf(['Client']).required(),
  ).default([]),
})

export const listBalances = wrap(async (req: Request) => {
  clientBalancesSchema.validateSync(req.query)
  const { sortBy, sortDir, include } = clientBalancesSchema.cast(req.query)

  if (sortBy === 'clientName' && !include.includes('Client'))
    include.push('Client')

  const order: Order = sortBy === 'clientName'
    ? [[Sequelize.col('Client.name'), sortDir]] as const
    : [[sortBy, sortDir]] as const

  const balances = await ClientBalances.findAll({ order, include })

  return ok({ items: balances })
})
