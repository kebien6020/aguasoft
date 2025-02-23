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

