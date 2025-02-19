// @ts-check
/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} Sequelize
 * @return {Promise<void>}
 */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('InventoryMovements', {
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
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    deletedAt: {
      allowNull: true,
      type: Sequelize.DATE,
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
}

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} _Sequelize
 * @return {Promise<void>}
 */
export async function down(queryInterface, _Sequelize) {
  await queryInterface.dropTable('InventoryMovements')
}
