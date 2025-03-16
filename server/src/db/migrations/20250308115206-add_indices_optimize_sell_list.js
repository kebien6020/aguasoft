// @ts-check
/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} _Sequelize
 * @return {Promise<void>}
 */
export async function up(queryInterface, _Sequelize) {
  await queryInterface.addIndex('Sells', ['date', 'updatedAt'], {
    name: 'Sells_dates',
  })

  await queryInterface.addIndex('Prices', ['clientId', 'productId', 'name'], {
    name: 'Prices_client_product_name',
  })
}

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} _Sequelize
 * @return {Promise<void>}
 */
export async function down(queryInterface, _Sequelize) {
  await queryInterface.removeIndex('Sells', 'Sells_dates')
  await queryInterface.removeIndex('Prices', 'Prices_client_product_name')
}
