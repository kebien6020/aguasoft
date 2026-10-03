export async function up({ context: { queryInterface, DataTypes } }) {
  await queryInterface.createTable('InventoryMovements', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    storageFromId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        table: 'Storages',
        key: 'id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    },
    storageToId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        table: 'Storages',
        key: 'id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    },
    inventoryElementFromId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        table: 'InventoryElements',
        key: 'id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    },
    inventoryElementToId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        table: 'InventoryElements',
        key: 'id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    },
    quantityFrom: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    quantityTo: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    cause: {
      type: DataTypes.ENUM(
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
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        table: 'Users',
        key: 'id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    deletedAt: {
      allowNull: true,
      type: DataTypes.DATE,
    },
    deletedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        table: 'Users',
        key: 'id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    },
  })
}

export async function down({ context: { queryInterface } }) {
  await queryInterface.dropTable('InventoryMovements')
}
