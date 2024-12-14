// @ts-check
'use strict'

module.exports = {
  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {typeof import('sequelize').Sequelize & typeof import ('sequelize').DataTypes} Sequelize
   * @return {Promise<void>}
   */
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Batches', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      expirationDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      batchCategoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'BatchCategories',
          key: 'id',
        },
        onDelete: 'restrict',
        onUpdate: 'cascade',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    })
    await queryInterface.addConstraint('Batches', ['date', 'batchCategoryId'], { type: 'unique' })
  },
  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @return {Promise<void>}
   */
  down: (queryInterface) => {
    return queryInterface.dropTable('Batches')
  },
}
