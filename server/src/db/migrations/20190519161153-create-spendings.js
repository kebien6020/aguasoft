export async function up({ context: { queryInterface, DataTypes } }) {
  return queryInterface.createTable('Spendings', {
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    fromCash: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isTransfer: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        table: 'Users',
        key: 'id',
      },
      onDelete: 'restrict',
      onUpdate: 'restrict',
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
      type: DataTypes.DATE,
    },
  })
}

export async function down({ context: { queryInterface } }) {
  return queryInterface.dropTable('Spendings')
}
