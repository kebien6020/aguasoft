// @ts-check
'use strict'

module.exports = {
  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {typeof import('sequelize').Sequelize & typeof import ('sequelize').DataTypes} Sequelize
   * @return {Promise<void>}
   */
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ProductVariants', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      productId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Products',
          key: 'id',
        },
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      basePrice: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    })
  },
  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @return {Promise<void>}
   */
  down: (queryInterface) => {
    return queryInterface.dropTable('ProductVariants')
  },
}
