// @ts-check
'use strict'

module.exports = {
  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {typeof import('sequelize').Sequelize & typeof import ('sequelize').DataTypes} Sequelize
   * @return {Promise<void>}
   */
  up: async (queryInterface, Sequelize) => {
    const now = new Date
    queryInterface.bulkInsert('InventoryElements', [
      {
        code: 'barra-hielo',
        name: 'Barra de Hielo',
        type: 'product',
        createdAt: now,
        updatedAt: now,
      },
    ])
  },
  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {typeof import('sequelize').Sequelize & typeof import ('sequelize').DataTypes} Sequelize
   * @return {Promise<void>}
   */
  down: async (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('InventoryElements', {
      code: 'barra-hielo',
    })
  },
}
