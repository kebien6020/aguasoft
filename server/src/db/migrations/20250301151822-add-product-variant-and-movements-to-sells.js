// @ts-check
/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} Sequelize
 * @return {Promise<void>}
 */
export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('Sells', 'productVariantId', {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'ProductVariants',
      key: 'id',
    },
    onDelete: 'restrict',
    onUpdate: 'cascade',
  })

  await queryInterface.addColumn('Sells', 'movementIds', {
    type: Sequelize.TEXT,
    allowNull: true,
  })
}

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} _Sequelize
 * @return {Promise<void>}
 */
export async function down(queryInterface, _Sequelize) {
  await queryInterface.removeColumn('Sells', 'productVariantId')
  await queryInterface.removeColumn('Sells', 'movementIds')
}
