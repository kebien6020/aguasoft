import models from '../db/models'
import createBalanceVerification from '../db/factories/balanceVerifications'
import createUser from '../db/factories/users'
import createClient from '../db/factories/clients'
import createProduct from '../db/factories/products'
import createSell from '../db/factories/sales'
import createSpending from '../db/factories/spendings'
import createPayment from '../db/factories/payments'

import * as request from 'supertest'
import { SuperTest, Test } from 'supertest'
import app from '../app'
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

    expect(promise).toResolve()

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

  it('allows getting the creator', async () => {
    const { verification } = await setup()
    await verification.reload({ include: ['createdBy'] })

    expect(verification.createdBy).toBeInstanceOf(Users)
  })
})

describe('Routes', () => {

  const setup = async () => {

    const agent = request.agent(app)
    const user = await createUser()
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
        }),
        success: false,
      }

      expect(res.body).toMatchObject(expectedResponse)
    })
    it('creates a verification', async () => {
      const { user, agent } = await setup()

      const res = await agent.post(url).send(mockData())

      expect(res.status).toBe(200)

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
        }),
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
        }),
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
        }),
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
        }),
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

    it('returns an error if there are no verifications', async () => {
      const { agent } = await setup()
      const res = await agent.get(url)

      expect(res.body).toMatchObject({
        success: false,
        error: expect.objectContaining({
          code: 'no_verifications',
        }),
      })
    })

    it('lists an empty balance if there are no sales, spendings or payments', async () => {
      const { agent, user } = await setup()

      await createBalanceVerification({
        date: moment().format('YYYY-MM-DD'),
        createdById: user.id,
      })

      const res = await agent.get(url)

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
      })

      await createSell({
        userId: user.id,
        clientId: client.id,
        productId: product.id,
        value: 5000,
        date: today,
      })

      const res = await agent.get(url)

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

    it('lists the sum of the spendings of the day balance in the balance', async () => {
      const { agent, user } = await setup()

      const today = moment().format('YYYY-MM-DD')
      await createBalanceVerification({
        date: today,
        createdById: user.id,
      })

      await createSpending({
        userId: user.id,
        value: 15000,
        date: today,
      })
      await createSpending({
        userId: user.id,
        value: 5000,
        date: today,
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

      const today = moment().format('YYYY-MM-DD')
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
        date: today,
      })
      await createPayment({
        userId: user.id,
        clientId: client.id,
        value: 5000,
        directPayment: false,
        date: today,
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
  })

})

async function login(agent: SuperTest<Test>, user: User): Promise<void> {
  await agent
    .post('/api/users/check')
    .send({ id: user.id, password: 'secret' })
    .expect(res => expect(res.body).toMatchObject({ result: true }))
}
