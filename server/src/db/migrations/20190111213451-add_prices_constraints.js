// @ts-check
const CLIENT_FKEY = 'fkey_clientId'
const PRODUCT_FKEY = 'fkey_productId'

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} _Sequelize
 * @return {Promise<void>}
 */
export function up(queryInterface, _Sequelize) {
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

  const sequelize = queryInterface.sequelize
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

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} _Sequelize
 * @return {Promise<void>}
 */
export function down(queryInterface, _Sequelize) {
  const sequelize = queryInterface.sequelize

  return sequelize.transaction(async t => {
    await queryInterface.removeConstraint('Prices', PRODUCT_FKEY, { transaction: t })
    await queryInterface.removeConstraint('Prices', CLIENT_FKEY, { transaction: t })
  })
}
