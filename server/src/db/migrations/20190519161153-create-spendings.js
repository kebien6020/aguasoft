export function up(queryInterface, Sequelize) {
  return queryInterface.createTable('Spendings', {
    date: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    value: {
      type: Sequelize.DECIMAL,
      allowNull: false,
    },
    fromCash: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isTransfer: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'restrict',
      onUpdate: 'restrict',
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
      type: Sequelize.DATE,
    },
  })
}
export function down(queryInterface, Sequelize) {
  return queryInterface.dropTable('Spendings')
}
