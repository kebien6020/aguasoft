// @ts-check
/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} Sequelize
 * @return {Promise<void>}
 */
export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('Products', 'batchCategoryId', {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'BatchCategories',
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
export function down(queryInterface, _Sequelize) {
  return queryInterface.removeColumn('Products', 'batchCategoryId')
}
