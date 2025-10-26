import type { Agent, Response } from 'supertest'

import createUser from '../db/factories/users.js'
import assert from 'node:assert/strict'
import { InventoryElements, Storages, StorageStates, Users } from '../db/models.js'
import { before, describe, it } from 'node:test'
import { truncateTables, withAgent } from './common.js'
import { MakeRequired } from '../utils/types.js'

const setup = async (agent: Agent) => {
  const user = await createUser({ role: 'admin' })

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

const assertSuccessRes = (res: Response) =>
  assert.partialDeepStrictEqual(res.body, { success: true })

describe('inventory routes', () => {
  before(truncateTables)

  it('creates movement for bolsa-360 and bolsa-reempaque when doing an unpack operation', async () => {
    await withAgent(async (agent) => {
      await setup(agent)
      // Setup
      const finalProductStorage = await Storages.findOne({ where: { code: 'terminado' } })
      assert.ok(finalProductStorage)

      const paca360Element = await InventoryElements.findOne({ where: { code: 'paca-360' } })
      assert.ok(paca360Element)

      await agent
        .post('/api/inventory/movements/manual')
        .send({
          storageFromId: null,
          storageToId: finalProductStorage.id,
          inventoryElementFromId: paca360Element.id,
          inventoryElementToId: paca360Element.id,
          quantityFrom: 1,
          quantityTo: 1,
        })
        .expect(assertSuccessRes)

      // Check
      await agent
        .post('/api/inventory/movements/unpack')
        .send({ amount: 1 })
        .expect(assertSuccessRes)

      type SS = MakeRequired<StorageStates, 'InventoryElement' | 'Storage'>
      type ResBody = SS[]

      await agent.get('/api/inventory/state?include[]=InventoryElement&include[]=Storage').expect(res => {
        const body = res.body as ResBody
        const bolsa360InIntermediate = body.find(ss => ss.InventoryElement.code === 'bolsa-360' && ss.Storage.code === 'intermedia')
        assert.ok(bolsa360InIntermediate, 'bolsa-360 not found in intermediate storage')
        const bolsaReempaqueInIntermediate = body.find(ss => ss.InventoryElement.code === 'bolsa-reempaque' && ss.Storage.code === 'trabajo')
        assert.ok(bolsaReempaqueInIntermediate, 'bolsa-reempaque not found in working storage')

        assert.equal(bolsa360InIntermediate.quantity, 20)
        assert.equal(bolsaReempaqueInIntermediate.quantity, 1)
      })
    })
  })
})
