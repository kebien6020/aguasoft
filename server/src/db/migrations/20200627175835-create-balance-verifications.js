export async function up({ context: { queryInterface, DataTypes } }) {
  return queryInterface.createTable('BalanceVerifications', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true,
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        table: 'Users',
        key: 'id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    },
    adjustAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  })
}

export async function down({ context: { queryInterface } }) {
  return queryInterface.dropTable('BalanceVerifications')
}
