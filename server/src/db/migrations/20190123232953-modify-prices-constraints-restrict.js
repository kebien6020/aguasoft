// @ts-check
const CLIENT_FKEY = 'fkey_clientId'
const PRODUCT_FKEY = 'fkey_productId'

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} _Sequelize
 * @return {Promise<void>}
 */
export function up(queryInterface, _Sequelize) {
  const sequelize = queryInterface.sequelize

  return sequelize.transaction(async t => {
    const commonOptions = /** @type {const} */ ({
      type: 'foreign key',
      // Prices must be deleted manually before deleting a client
      onDelete: 'restrict',
      onUpdate: 'cascade',
      transaction: t,
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

    await queryInterface.removeConstraint('Prices', PRODUCT_FKEY, { transaction: t })
    await queryInterface.removeConstraint('Prices', CLIENT_FKEY, { transaction: t })
    await queryInterface.addConstraint('Prices', clientOptions)
    await queryInterface.addConstraint('Prices', productOptions)
  })
}

/**
 * @param {import('sequelize').QueryInterface} _queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} _Sequelize
 * @return {Promise<void>}
 */
export async function down(_queryInterface, _Sequelize) {
  // Not reversing this query should not cause any problems since
  // the constraints still exist and are called the same
}
