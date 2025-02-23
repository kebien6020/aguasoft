import * as request from 'supertest'
import type { Agent } from 'supertest'
import createClient from '../db/factories/clients.js'
import { make as makeSale } from '../db/factories/sales.js'
import createProduct from '../db/factories/products.js'
import createUser from '../db/factories/users.js'
import createBatchCategory from '../db/factories/batchCategories.js'
import app from '../app.js'
import { createMovement } from '../routes/inventory.js'
import {
  InventoryElements,
  Storages,
  StorageStates,
  ProductVariants,
  Users,
} from '../db/models.js'
import { server } from '../index.js'
import { describe, it, after, afterEach, before } from 'node:test'
import assert from 'node:assert/strict'
import { truncateTables } from './common.js'

const setup = async () => {

  const agent = request.agent(app)
  const user = await createUser()

  assert.equal((await Users.findAll()).length, 1)
  const valUser = (await Users.findAll())[0]
  assert.equal(valUser.id, user.id)

  await login(agent, user)

  return { user, agent } as const
}

async function login(agent: Agent, user: Users): Promise<void> {
  await agent
    .post('/api/users/check')
    .send({ id: user.id, password: 'secret' })
    .expect(res => assert.partialDeepStrictEqual(res.body, { result: true }))
}

describe('sales routes', () => {

  before(truncateTables)
  after(async () => {
    if (server.listening) {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) {
            reject(err)
            return
          }
          resolve()
        })
      })
    }
  })

  afterEach(truncateTables)

  it('creates movements for termoencogible and tapa-valvula on sale of botellon-nuevo', async () => {
    const { agent, user } = await setup()
    const url = '/api/sells/bulkNew'
    const client = await createClient()
    const batchCategory = await createBatchCategory()
    const product = await createProduct({
      batchCategoryId: batchCategory.id,
      code: '005', // botellon-nuevo
    })
    const variant = await ProductVariants.create({
      productId: product.id,
      code: 'tapa-valvula',
      name: 'Tapa Válvula',
    })
    const invElemBotellonNuevo = await InventoryElements.findOne({
      where: { code: 'botellon-nuevo' },
    })
    assert.ok(invElemBotellonNuevo)

    const invElemTapaValvula = await InventoryElements.findOne({
      where: { code: 'tapa-valvula' },
    })
    assert.ok(invElemTapaValvula)

    const invElemTermoencogible = await InventoryElements.findOne({
      where: { code: 'termoencogible' },
    })
    assert.ok(invElemTermoencogible)

    const stgBodega = await Storages.findOne({
      where: { code: 'bodega' },
    })
    assert.ok(stgBodega)

    const stgTrabajo = await Storages.findOne({
      where: { code: 'trabajo' },
    })
    assert.ok(stgTrabajo)

    await createMovement({
      cause: 'in',
      createdBy: user.id,
      inventoryElementFromId: invElemBotellonNuevo.id,
      inventoryElementToId: invElemBotellonNuevo.id,
      quantityFrom: 10,
      storageFromId: null,
      storageToId: stgBodega.id,
    })
    await createMovement({
      cause: 'in',
      createdBy: user.id,
      inventoryElementFromId: invElemTapaValvula.id,
      inventoryElementToId: invElemTapaValvula.id,
      quantityFrom: 10,
      storageFromId: null,
      storageToId: stgTrabajo.id,
    })
    await createMovement({
      cause: 'in',
      createdBy: user.id,
      inventoryElementFromId: invElemTermoencogible.id,
      inventoryElementToId: invElemTermoencogible.id,
      quantityFrom: 10,
      storageFromId: null,
      storageToId: stgTrabajo.id,
    })

    const sale = makeSale({
      userId: user.id,
      clientId: client.id,
      productId: product.id,
      quantity: 1,
    })

    const saleForReq = { ...sale.toJSON(), variantId: variant.id }

    const data = {
      sells: [saleForReq],
    }

    const res = await agent
      .post(url)
      .send(data)

    assert(res.body?.success)

    const btNuevoState = await StorageStates.findOne({
      where: {
        inventoryElementId: invElemBotellonNuevo.id,
        storageId: stgBodega.id,
      },
    })
    assert.ok(btNuevoState)

    const termoencogibleState = await StorageStates.findOne({
      where: {
        inventoryElementId: invElemTermoencogible.id,
        storageId: stgTrabajo.id,
      },
    })
    assert.ok(termoencogibleState)

    const tapaValvulaState = await StorageStates.findOne({
      where: {
        inventoryElementId: invElemTapaValvula.id,
        storageId: stgTrabajo.id,
      },
    })
    assert.ok(tapaValvulaState)

    assert.equal(btNuevoState.quantity, 9)
    assert.equal(termoencogibleState.quantity, 9)
    assert.equal(tapaValvulaState.quantity, 9)
  })

})
