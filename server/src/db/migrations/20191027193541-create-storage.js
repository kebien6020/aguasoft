// @ts-check
'use strict'

module.exports = {
  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} Sequelize
   * @return {Promise<unknown>}
   */
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Storages', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    }).then(() => {
      return queryInterface.bulkInsert('Storages', [
        {
          code: 'bodega',
          name: 'Bodega',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          code: 'trabajo',
          name: 'Area de Trabajo',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          code: 'intermedia',
          name: 'Area de Empaque',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          code: 'terminado',
          name: 'Producto Terminado',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
    })
  },

  down: (queryInterface, _Sequelize) => {
    return queryInterface.dropTable('Storages')
  },
}
