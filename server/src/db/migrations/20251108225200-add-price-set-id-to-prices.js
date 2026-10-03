export async function up({ context: { queryInterface, DataTypes } }) {
  await queryInterface.addColumn('Prices', 'priceSetId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      table: 'PriceSets',
      key: 'id',
    },
    onDelete: 'restrict',
    onUpdate: 'cascade',
  })
}

export async function down({ context: { queryInterface } }) {
  await queryInterface.removeColumn('Prices', 'priceSetId')
}
