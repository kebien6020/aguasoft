export async function up({ context: { queryInterface, DataTypes } }) {
  await queryInterface.addColumn('Prices', 'name', {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Base',
  })

  await queryInterface.addConstraint('Prices', {
    type: 'unique',
    name: 'name_clientId_productId_unique',
    fields: ['name', 'clientId', 'productId'],
  })
}

export async function down({ context: { queryInterface } }) {
  await queryInterface.removeConstraint('Prices', 'name_clientId_productId_unique')
  await queryInterface.removeColumn('Prices', 'name')
}
