import {
  BalanceVerifications,
  BatchCategories,
  Batches,
  Clients,
  InventoryMovements,
  Payments,
  Prices,
  Products,
  ProductVariants,
  Sells,
  Session,
  Spendings,
  StorageStates,
  Users,
} from '../db/models.js'
import { Server } from 'node:http'
import app from '../app.js'
import supertest from 'supertest'
import { Agent } from 'supertest'

export const truncateTables = async () => {
  const opts = { cascade: true, force: true }
  await Promise.all([
    Payments.truncate(opts),
    Spendings.truncate(opts),
    Sells.truncate(opts),
    Session.truncate(opts),
    Prices.truncate(opts),
    Batches.truncate(opts),
    ProductVariants.truncate(opts),
    InventoryMovements.truncate(opts),
    StorageStates.truncate(opts),
  ])
  await Promise.all([
    Products.truncate(opts),
    Clients.truncate(opts),
    BalanceVerifications.truncate(opts),
  ])
  await Promise.all([
    Users.truncate(opts),
    BatchCategories.truncate(opts),
  ])
}

const close = (server: Server) =>
  new Promise<void>((resolve, reject) => {
    server.close(err => {
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  })

export const withAgent = async (fn: (agent: Agent) => Promise<void>) => {
  const port = 3001
  const server = app.listen(port)
  const agent = supertest.agent(`http://localhost:${port}`)
  fn(agent).finally(() => close(server))
}
