// @ts-check
/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} _Sequelize
 * @return {Promise<void>}
 */
export async function up(queryInterface, _Sequelize) {
  const now = new Date
  await queryInterface.bulkInsert('InventoryElements', [
    {
      code: 'barra-hielo',
      name: 'Barra de Hielo',
      type: 'product',
      createdAt: now,
      updatedAt: now,
    },
  ])
}

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} _Sequelize
 * @return {Promise<void>}
 */
export async function down(queryInterface, _Sequelize) {
  await queryInterface.bulkDelete('InventoryElements', {
    code: 'barra-hielo',
  })
}
