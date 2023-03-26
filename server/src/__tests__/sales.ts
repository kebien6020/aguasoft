import * as request from 'supertest'
import { SuperTest, Test } from 'supertest'
import createClient from '../db/factories/clients'
import { make as makeSale } from '../db/factories/sales'
import createProduct from '../db/factories/products'
import createUser from '../db/factories/users'
import app from '../app'
import { User } from '../db/models/users'
import { createMovement } from '../routes/inventory'
import models from '../db/models'
import { server } from '../index'

const {
  InventoryElements,
  Storages,
  InventoryMovements,
  StorageStates,
  Clients,
  Products,
  ProductVariants,
  Users,
  Sells,
  Session,
} = models

const setup = async () => {

  const agent = request.agent(app)
  const user = await createUser()
  await login(agent, user)

  return { user, agent } as const
}

afterAll(async () => {
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

afterEach(async () => {
  const opts = { cascade: true, force: true }
  await Promise.all([
    InventoryMovements.truncate(opts),
    StorageStates.truncate(opts),
    Sells.truncate(opts),
    Session.truncate(opts),
    Products.truncate(opts),
    Clients.truncate(opts),
    ProductVariants.truncate(opts),
  ])
  await Users.truncate(opts)
})
it('creates movements for termoencogible and tapa-valvula on sale of botellon-nuevo', async () => {
  const { agent, user } = await setup()
  const url = '/api/sells/bulkNew'
  const client = await createClient()
  const product = await createProduct({
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
  const invElemTapaValvula = await InventoryElements.findOne({
    where: { code: 'tapa-valvula' },
  })
  const invElemTermoencogible = await InventoryElements.findOne({
    where: { code: 'termoencogible' },
  })
  const stgBodega = await Storages.findOne({
    where: { code: 'bodega' },
  })
  const stgTrabajo = await Storages.findOne({
    where: { code: 'trabajo' },
  })
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
    userId: undefined,
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

  expect(res.body).toMatchObject({ success: true })

  const btNuevoState = await StorageStates.findOne({
    where: {
      inventoryElementId: invElemBotellonNuevo.id,
      storageId: stgBodega.id,
    },
  })

  const termoencogibleState = await StorageStates.findOne({
    where: {
      inventoryElementId: invElemTermoencogible.id,
      storageId: stgTrabajo.id,
    },
  })

  const tapaValvulaState = await StorageStates.findOne({
    where: {
      inventoryElementId: invElemTapaValvula.id,
      storageId: stgTrabajo.id,
    },
  })

  expect(btNuevoState.quantity).toBe(9)
  expect(termoencogibleState.quantity).toBe(9)
  expect(tapaValvulaState.quantity).toBe(9)
})

async function login(agent: SuperTest<Test>, user: User): Promise<void> {
  await agent
    .post('/api/users/check')
    .send({ id: user.id, password: 'secret' })
    .expect(res => expect(res.body).toMatchObject({ result: true }))
}
