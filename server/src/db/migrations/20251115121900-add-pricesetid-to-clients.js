// @ts-check
/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} Sequelize
 * @return {Promise<void>}
 */
export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('Clients', 'priceSetId', {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'PriceSets',
      key: 'id',
    },
    onDelete: 'restrict',
    onUpdate: 'cascade',
  })
}

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} _Sequelize
 * @return {Promise<void>}
 */
export async function down(queryInterface, _Sequelize) {
  await queryInterface.removeColumn('Clients', 'priceSetId')
}
