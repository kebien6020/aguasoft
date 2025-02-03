// @ts-check
'use strict'

module.exports = {
  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {typeof import('sequelize').Sequelize & typeof import ('sequelize').DataTypes} Sequelize
   * @return {Promise<void>}
   */
  up: async (queryInterface, Sequelize) => {
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
  },
  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @return {Promise<void>}
   */
  down: (queryInterface) => {
    return queryInterface.removeColumn('Products', 'batchCategoryId')
  },
}
