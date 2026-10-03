export async function up({ context: { queryInterface, DataTypes } }) {
  return queryInterface.createTable('Payments', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        table: 'Clients',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        table: 'Users',
        key: 'id',
      },
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    dateFrom: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    dateTo: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    invoiceNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    invoiceDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    directPayment: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
  })
}

export async function down({ context: { queryInterface } }) {
  return queryInterface.dropTable('Payments')
}
