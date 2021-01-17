import { format, subDays } from 'date-fns'
import * as request from 'supertest'
import { SuperTest, Test } from 'supertest'
import app from '../app'
import createBalanceVerification from '../db/factories/balanceVerifications'
import createClient from '../db/factories/clients'
import createPayment from '../db/factories/payments'
import createProduct from '../db/factories/products'
import createSell from '../db/factories/sales'
import createSpending from '../db/factories/spendings'
import createUser from '../db/factories/users'
import models from '../db/models'
import { User } from '../db/models/users'

import moment = require('moment')

const {
  BalanceVerifications,
  Clients,
  Payments,
  Products,
  Sells,
  Session,
  Spendings,
  Users,
} = models

const formatDay = (date: Date) => format(date, 'yyyy-MM-dd')

afterEach(async () => {
  const opts = { cascade: true, force: true }
  await Promise.all([
    Payments.truncate(opts),
    Spendings.truncate(opts),
    Sells.truncate(opts),
    Session.truncate(opts),
  ])
  await Promise.all([
    Products.truncate(opts),
    Clients.truncate(opts),
    BalanceVerifications.truncate(opts),
  ])
  await Users.truncate(opts)
})

describe('Model', () => {
  it('migration has run', async () => {
    const logger = jest.fn((sql) => {
      expect(sql).toMatchInlineSnapshot(
        '"Executing (default): SELECT `id`, `date`, `createdById`, `adjustAmount`, `amount` FROM `BalanceVerifications` AS `BalanceVerifications` LIMIT 1;"'
      )
    })

    const promise = BalanceVerifications.findOne({
      attributes: ['id', 'date', 'createdById', 'adjustAmount', 'amount'],
      logging: logger,
    })

    void expect(promise).toResolve()

    await promise

    expect(logger).toHaveBeenCalled()
  })

  const setup = async () => {
    const user = await createUser()
    const verification = await createBalanceVerification({
      createdById: user.id,
    })
    return { user, verification } as const
  }

  it('retrieves the amounts as numbers', async () => {
    const { verification } = await setup()

    expect(verification.amount).toBeNumber()
    expect(verification.adjustAmount).toBeNumber()
  })

  it('retrieves the date as a string', async () => {
    const { verification } = await setup()

    expect(verification.date).toBeString()
  })

  it('allows getting the creator', async () => {
    const { verification } = await setup()
    await verification.reload({ include: ['createdBy'] })

    expect(verification.createdBy).toBeInstanceOf(Users)
  })
})

describe('Routes', () => {

  const setup = async () => {

    const agent = request.agent(app)
    const user = await createUser({ role: 'admin' })
    await login(agent, user)

    return { user, agent } as const
  }

  describe('POST /api/balance/verification', () => {
    const url = '/api/balance/verification'
    const mockData = (overrides?: Record<string, unknown>) => ({
      date: new Date().toISOString(),
      amount: 50e3,
      ...overrides,
    })

    it('validates the user is logged in', async () => {
      const agent = request.agent(app)

      const res = await agent
        .post(url)
        .send(mockData())

      const expectedResponse = {
        error: expect.objectContaining({
          code: 'user_check_error',
        }) as unknown,
        success: false,
      }

      expect(res.body).toMatchObject(expectedResponse)
    })
    it('creates a verification', async () => {
      const { user, agent } = await setup()

      const res = await agent.post(url).send(mockData())

      expect(res.status).toBe(200)
      expect(res).not.toMatchObject({ success: false })

      const createdVerification = await BalanceVerifications.findOne({
        where: { createdById: user.id },
      })

      expect(createdVerification).not.toBeNull()
    })

    it('validates the date is present', async () => {
      const {
        agent,
      } = await setup()

      const res = await agent
        .post(url)
        .send(mockData({ date: undefined }))

      const expectedResponse = {
        error: expect.objectContaining({
          code: 'ValidationError',
          type: 'required',
          path: 'date',
        }) as unknown,
        success: false,
      }

      expect(res.body).toMatchObject(expectedResponse)
    })

    it('validates the format of the date', async () => {
      const { agent } = await setup()

      const res = await agent
        .post(url)
        .send(mockData({ date: 'Invalid date' }))

      const expectedResponse = {
        error: expect.objectContaining({
          code: 'ValidationError',
          type: 'typeError',
          path: 'date',
        }) as unknown,
        success: false,
      }

      expect(res.body).toMatchObject(expectedResponse)
    })

    it('validates the amount is present', async () => {
      const { agent } = await setup()
      const res = await agent
        .post(url)
        .send(mockData({ amount: undefined }))

      const expectedResponse = {
        error: expect.objectContaining({
          code: 'ValidationError',
          type: 'required',
          path: 'amount',
        }) as unknown,
        success: false,
      }

      expect(res.body).toMatchObject(expectedResponse)
    })

    it('validates the amount is numeric', async () => {
      const { agent } = await setup()

      const res = await agent
        .post(url)
        .send(mockData({ amount: 'holi' }))

      const expectedResponse = {
        error: expect.objectContaining({
          code: 'ValidationError',
          type: 'typeError',
          path: 'amount',
        }) as unknown,
        success: false,
      }

      expect(res.body).toMatchObject(expectedResponse)
    })

  })

  describe('GET /api/balance', () => {
    const setup = async () => {
      const agent = request.agent(app)
      const user = await createUser()
      await login(agent, user)

      return { agent, user }
    }

    const url = '/api/balance'

    type BalanceElement = {
        date: string,
        spendings: number,
        sales: number,
        payments: number,
        balance: number,
    }
    interface BalanceSuccessResponse extends request.Response {
      body: {
        success: true,
        data: BalanceElement[],
      },
    }

    it('returns an error if there are no verifications', async () => {
      const { agent } = await setup()
      const res: BalanceSuccessResponse = await agent.get(url)

      expect(res.body).toMatchObject({
        success: false,
        error: expect.objectContaining({
          code: 'no_verifications',
        }) as unknown,
      })
    })

    it('lists an empty balance if there are no sales, spendings or payments', async () => {
      const { agent, user } = await setup()

      await createBalanceVerification({
        date: moment().format('YYYY-MM-DD'),
        createdById: user.id,
      })

      const res: BalanceSuccessResponse = await agent.get(url)

      expect(res.body).toMatchObject({
        success: true,
        data: [
          expect.objectContaining({
            date: moment().format('YYYY-MM-DD'),
            sales: 0,
            spendings: 0,
            payments: 0,
          }),
        ],
      })
    })

    it('lists the sum of the sales of the day balance in the balance', async () => {
      const { agent, user } = await setup()

      const today = moment().format('YYYY-MM-DD')
      await createBalanceVerification({
        date: today,
        createdById: user.id,
      })

      const client = await createClient()
      const product = await createProduct()

      await createSell({
        userId: user.id,
        clientId: client.id,
        productId: product.id,
        value: 3000,
        date: today,
        cash: true,
      })

      await createSell({
        userId: user.id,
        clientId: client.id,
        productId: product.id,
        value: 5000,
        date: today,
        cash: true,
      })

      const res: BalanceSuccessResponse = await agent.get(url)

      expect(res.body).toMatchObject({
        success: true,
        data: [
          expect.objectContaining({
            date: moment().format('YYYY-MM-DD'),
            sales: 8000,
            spendings: 0,
            payments: 0,
          }),
        ],
      })
    })

    it('only counts sales with cash true', async () => {
      const { agent, user } = await setup()

      const today = moment().format('YYYY-MM-DD')
      await createBalanceVerification({
        date: today,
        createdById: user.id,
      })

      const client = await createClient()
      const product = await createProduct()

      await createSell({
        userId: user.id,
        clientId: client.id,
        productId: product.id,
        value: 3000,
        date: today,
        cash: true,
      })

      await createSell({
        userId: user.id,
        clientId: client.id,
        productId: product.id,
        value: 5000,
        date: today,
        cash: false,
      })

      const res: BalanceSuccessResponse = await agent.get(url)

      expect(res.body).toMatchObject({
        success: true,
        data: [
          expect.objectContaining({
            date: moment().format('YYYY-MM-DD'),
            sales: 3000,
            spendings: 0,
            payments: 0,
          }),
        ],
      })
    })

    it('doesn\'t count deleted sales', async () => {
      const { agent, user } = await setup()

      const today = moment().format('YYYY-MM-DD')
      await createBalanceVerification({
        date: today,
        createdById: user.id,
      })

      const client = await createClient()
      const product = await createProduct()

      await createSell({
        userId: user.id,
        clientId: client.id,
        productId: product.id,
        value: 3000,
        date: today,
        cash: true,
        deleted: true,
      })

      await createSell({
        userId: user.id,
        clientId: client.id,
        productId: product.id,
        value: 5000,
        date: today,
        cash: true,
      })

      const res: BalanceSuccessResponse = await agent.get(url)

      expect(res.body).toMatchObject({
        success: true,
        data: [
          expect.objectContaining({
            date: moment().format('YYYY-MM-DD'),
            sales: 5000,
            spendings: 0,
            payments: 0,
          }),
        ],
      })
    })

    it('lists the sum of the spendings of the day balance in the balance', async () => {
      const { agent, user } = await setup()

      const today = formatDay(new Date)
      const todayTimestamp = (new Date).toISOString()
      await createBalanceVerification({
        date: today,
        createdById: user.id,
      })

      await createSpending({
        userId: user.id,
        value: 15000,
        date: todayTimestamp,
      })
      await createSpending({
        userId: user.id,
        value: 5000,
        date: todayTimestamp,
      })

      const res = await agent.get(url)

      expect(res.body).toMatchObject({
        success: true,
        data: [
          expect.objectContaining({
            date: moment().format('YYYY-MM-DD'),
            sales: 0,
            spendings: 20000,
            payments: 0,
          }),
        ],
      })
    })

    it('lists the sum of the payments of the day balance in the balance', async () => {
      const { agent, user } = await setup()

      const today = formatDay(new Date)
      const now = (new Date).toISOString()
      await createBalanceVerification({
        date: today,
        createdById: user.id,
      })

      const client = await createClient()

      await createPayment({
        userId: user.id,
        clientId: client.id,
        value: 15000,
        directPayment: true,
        date: now,
      })
      await createPayment({
        userId: user.id,
        clientId: client.id,
        value: 5000,
        directPayment: false,
        date: now,
      })

      const res = await agent.get(url)

      expect(res.body).toMatchObject({
        success: true,
        data: [
          expect.objectContaining({
            date: moment().format('YYYY-MM-DD'),
            sales: 0,
            spendings: 0,
            payments: 15000,
          }),
        ],
      })
    })

    it('calculates the balance from the verification', async () => {
      const { user, agent } = await setup()

      const yesterday = formatDay(subDays(new Date, 1))
      const yesterdayTimestamp = subDays(new Date, 1).toISOString()
      const today = formatDay(new Date)
      const todayTimestamp = (new Date).toISOString()
      await createBalanceVerification({
        date: yesterday,
        createdById: user.id,
        amount: 12000,
        adjustAmount: 0,
      })

      const client = await createClient()
      const product = await createProduct()

      await createSell({
        date: yesterday,
        userId: user.id,
        clientId: client.id,
        productId: product.id,
        value: 5000,
        cash: true,
      })

      await createSell({
        date: today,
        userId: user.id,
        clientId: client.id,
        productId: product.id,
        value: 8000,
        cash: true,
      })

      await createPayment({
        date: yesterdayTimestamp,
        userId: user.id,
        clientId: client.id,
        value: 3000,
        directPayment: true,
      })

      await createPayment({
        date: todayTimestamp,
        userId: user.id,
        clientId: client.id,
        value: 10000,
        directPayment: true,
      })

      await createSpending({
        date: yesterdayTimestamp,
        userId: user.id,
        value: 2000,
      })

      const res: BalanceSuccessResponse = await agent.get(url)

      const expectedYesterdayBalance = 12000 + 5000 + 3000 - 2000
      expect(res.body.data[0]).toMatchObject({
        date: yesterday,
        spendings: 2000,
        sales: 5000,
        payments: 3000,
        balance: expectedYesterdayBalance,
      })

      const expectedTodayBalance = expectedYesterdayBalance + 8000 + 10000
      expect(res.body.data[1]).toMatchObject({
        date: today,
        spendings: 0,
        sales: 8000,
        payments: 10000,
        balance: expectedTodayBalance,
      })
    })

    it('includes the verifications within the registers of the corresponding date', async () => {
      const { user, agent } = await setup()

      const now = new Date
      const tm3 = subDays(now, 3)
      const tm2 = subDays(now, 2)
      const tm1 = subDays(now, 1)

      await createBalanceVerification({
        date: formatDay(tm3),
        amount: 5000,
        adjustAmount: 0,
        createdById: user.id,
      })

      await createSpending({
        date: tm2.toISOString(),
        userId: user.id,
        directPayment: true,
        value: 2000,
      })

      await createBalanceVerification({
        date: formatDay(tm1),
        adjustAmount: -1000,
        amount: 2000,
        createdById: user.id,
      })

      const res: BalanceSuccessResponse = await agent.get(url)

      expect(res.body).toMatchObject({
        data: [
          expect.objectContaining({
            date: formatDay(tm3),
            verification: expect.objectContaining({
              amount: 5000,
              adjustAmount: 0,
            }) as unknown,
            balance: 5000,
          }) as unknown,
          expect.objectContaining({
            date: formatDay(tm2),
            spendings: 2000,
            balance: 3000,
          }) as unknown,
          expect.objectContaining({
            date: formatDay(tm1),
            verification: expect.objectContaining({
              amount: 2000,
              adjustAmount: -1000,
            }) as unknown,
            balance: 2000,
          }) as unknown,
          expect.objectContaining({
            date: formatDay(now),
            balance: 2000,
          }) as unknown,
        ],
      })
    })

    it('can be filtered by min and max date', async () => {
      const { user, agent } = await setup()

      const tm3 = moment().subtract(3, 'days').format('YYYY-MM-DD')
      const tm2 = moment().subtract(2, 'days').format('YYYY-MM-DD')
      const tm1 = moment().subtract(1, 'days').format('YYYY-MM-DD')
      await createBalanceVerification({
        date: tm3,
        adjustAmount: 0,
        amount: 5000,
        createdById: user.id,
      })

      const res: BalanceSuccessResponse = await agent.get(url + `?minDate=${tm2}&maxDate=${tm1}`)

      expect(res.body.data).toEqual([
        expect.objectContaining({ date: tm2 }),
        expect.objectContaining({ date: tm1 }),
      ])
    })

    it('includes createdBy if specified in includes param', async () => {
      const { user, agent } = await setup()

      const today = moment().format('YYYY-MM-DD')

      await createBalanceVerification({
        date: today,
        amount: 5000,
        adjustAmount: 0,
        createdById: user.id,
      })

      const res: BalanceSuccessResponse = await agent.get(url + '?includes[]=verification.createdBy')

      expect(res.body.data).toEqual([
        expect.objectContaining({
          date: today,
          verification: expect.objectContaining({
            createdBy: expect.objectContaining({
              id: user.id,
              name: user.name,
              role: user.role,
            }) as unknown,
          }) as unknown,
        }),
      ])
    })

    it('uses the local timezone when grouping by day', async () => {
      const { user, agent } = await setup()

      const today = '2020-12-30'

      await createBalanceVerification({
        date: today,
        amount: 5000,
        adjustAmount: 0,
        createdById: user.id,
      })

      const client = await createClient()

      await createPayment({
        date: '2020-12-31T04:38:14.576Z', // "today" at 23:38 in UTC+0
        value: 8000,
        userId: user.id,
        clientId: client.id,
        directPayment: true,
      })

      await createSpending({
        date: '2020-12-30T06:38:14.576Z', // "today" at 1:38 in UTC+0
        value: 4000,
        userId: user.id,
        directPayment: true,
      })

      const res: BalanceSuccessResponse = await agent.get(`${url}?minDate=${today}&maxDate=${today}`)

      expect(res.body).toMatchObject({
        data: [
          expect.objectContaining({
            date: today,
            balance: 5000 + 8000 - 4000,
          }) as unknown,
        ],
      })
    })

  })

  describe('GET /api/balance/:date', () => {
    it('calculates the balance at a specific date', async () => {
      const { agent, user } = await setup()

      const now = new Date
      const tm3 = subDays(now, 3)
      const tm2 = subDays(now, 2)
      const tm1 = subDays(now, 1)

      await createBalanceVerification({
        date: formatDay(tm3),
        adjustAmount: 0,
        amount: 5000,
        createdById: user.id,
      })

      await createBalanceVerification({
        date: formatDay(tm2),
        adjustAmount: -2000,
        amount: 3000,
        createdById: user.id,
      })

      const client = await createClient()

      await createPayment({
        date: tm1.toISOString(),
        value: 10000,
        userId: user.id,
        clientId: client.id,
      })

      await createPayment({
        date: now.toISOString(),
        value: 10000,
        userId: user.id,
        clientId: client.id,
      })

      const res = await agent.get(`/api/balance/${formatDay(tm1)}`)

      expect(res.body).toMatchObject({
        success: true,
        data: 3000 + 10000,
      })
    })
  })
})

async function login(agent: SuperTest<Test>, user: User): Promise<void> {
  await agent
    .post('/api/users/check')
    .send({ id: user.id, password: 'secret' })
    .expect(res => expect(res.body).toMatchObject({ result: true }))
}
