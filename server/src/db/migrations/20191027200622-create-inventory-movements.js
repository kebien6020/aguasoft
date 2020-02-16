'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('InventoryMovements', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      storageFromId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Storages',
          key: 'id',
        },
        onDelete: 'restrict',
        onUpdate: 'cascade',
      },
      storageToId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Storages',
          key: 'id',
        },
        onDelete: 'restrict',
        onUpdate: 'cascade',
      },
      inventoryElementFromId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'InventoryElements',
          key: 'id',
        },
        onDelete: 'restrict',
        onUpdate: 'cascade',
      },
      inventoryElementToId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'InventoryElements',
          key: 'id',
        },
        onDelete: 'restrict',
        onUpdate: 'cascade',
      },
      quantityFrom: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
      },
      quantityTo: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
      },
      cause: {
        type: Sequelize.ENUM(
          'manual',
          'in',
          'relocation',
          'production',
          'sell',
          'damage',
        ),
        allowNull: false,
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'restrict',
        onUpdate: 'cascade',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      deletedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'restrict',
        onUpdate: 'cascade',
      },
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('InventoryMovements');
  }
};
