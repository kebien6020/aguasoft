'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('StorageStates', {
      storageId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Storages',
          key: 'id',
        },
        onDelete: 'restrict',
        onUpdate: 'cascade',
      },
      inventoryElementId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'InventoryElements',
          key: 'id',
        },
        onDelete: 'restrict',
        onUpdate: 'cascade',
      },
      quantity: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
    }).then(() =>
      queryInterface.addConstraint('StorageStates', [
        'storageId',
        'inventoryElementId',
      ], {
        type: 'primary key',
        name: 'StorageStates_pk',
      })
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('StorageStates');
  }
};
