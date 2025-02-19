export function up(queryInterface, Sequelize) {
  return queryInterface.createTable('Payments', {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    value: {
      type: Sequelize.DECIMAL(20, 8),
      allowNull: false,
    },
    clientId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Clients',
        key: 'id',
      },
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    date: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    dateFrom: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    dateTo: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    invoiceNo: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    invoiceDate: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    directPayment: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
  })
}
export function down(queryInterface, Sequelize) {
  return queryInterface.dropTable('Payments')
}
