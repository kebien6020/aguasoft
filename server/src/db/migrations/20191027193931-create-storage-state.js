export async function up({ context: { queryInterface, DataTypes } }) {
  await queryInterface.createTable('StorageStates', {
    storageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        table: 'Storages',
        key: 'id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    },
    inventoryElementId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        table: 'InventoryElements',
        key: 'id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  })

  await queryInterface.addConstraint('StorageStates', {
    type: 'primary key',
    name: 'StorageStates_pk',
    fields: ['storageId', 'inventoryElementId'],
  })
}

export async function down({ context: { queryInterface } }) {
  await queryInterface.dropTable('StorageStates')
}
