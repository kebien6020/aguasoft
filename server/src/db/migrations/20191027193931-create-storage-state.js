// @ts-check
/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} Sequelize
 * @return {Promise<void>}
 */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('StorageStates', {
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
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  })

  await queryInterface.addConstraint('StorageStates', {
    type: 'primary key',
    name: 'StorageStates_pk',
    fields: ['storageId', 'inventoryElementId'],
  })
}

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} _Sequelize
 * @return {Promise<void>}
 */
export async function down(queryInterface, _Sequelize) {
  await queryInterface.dropTable('StorageStates')
}
