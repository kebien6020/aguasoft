// @ts-check
/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} Sequelize
 * @return {Promise<void>}
 */
export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('Prices', 'name', {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'Base',
  })

  await queryInterface.addConstraint('Prices', {
    type: 'unique',
    name: 'name_clientId_productId_unique',
    fields: ['name', 'clientId', 'productId'],
  })
}

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} _Sequelize
 * @return {Promise<void>}
 */
export async function down(queryInterface, _Sequelize) {
  await queryInterface.removeConstraint('Prices', 'name_clientId_productId_unique')
  await queryInterface.removeColumn('Prices', 'name')
}
