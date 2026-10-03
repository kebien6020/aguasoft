const CLIENT_FKEY = 'fkey_clientId'
const PRODUCT_FKEY = 'fkey_productId'

export async function up({ context: { queryInterface, sequelize } }) {
  const commonOptions = /** @type {const} */ ({
    type: 'foreign key',
    // When deleting clients or products, all the
    // associated prices are deleted
    onDelete: 'cascade',
    onUpdate: 'cascade',
  })

  const clientOptions = {
    ...commonOptions,
    name: CLIENT_FKEY,
    references: {
      table: 'Clients',
      field: 'id',
    },
    fields: ['clientId'],
  }

  const productOptions = {
    ...commonOptions,
    name: PRODUCT_FKEY,
    references: {
      table: 'Products',
      field: 'id',
    },
    fields: ['productId'],
  }

  const trans =
    (/** @type {import("sequelize").Transaction} */ t) =>
      (/** @type {typeof clientOptions | typeof productOptions} */ obj) =>
        ({ ...obj, transaction: t })

  return sequelize.transaction(async (t) => {
    const tr = trans(t)
    await queryInterface.addConstraint('Prices', tr(clientOptions))
    await queryInterface.addConstraint('Prices', tr(productOptions))
  })

}

export function down({ context: { queryInterface, sequelize } }) {
  return sequelize.transaction(async t => {
    await queryInterface.removeConstraint('Prices', PRODUCT_FKEY, { transaction: t })
    await queryInterface.removeConstraint('Prices', CLIENT_FKEY, { transaction: t })
  })
}
