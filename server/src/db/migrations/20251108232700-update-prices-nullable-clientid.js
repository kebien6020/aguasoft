export async function up({ context: { queryInterface, DataTypes } }) {
  await queryInterface.changeColumn('Prices', 'clientId', {
    type: DataTypes.INTEGER,
    allowNull: true,
  })
}

export async function down({ context: { queryInterface, DataTypes } }) {
  await queryInterface.changeColumn('Prices', 'clientId', {
    type: DataTypes.INTEGER,
    allowNull: false,
  })
}
