export async function up({ context: { queryInterface, DataTypes } }) {
  await queryInterface.addColumn('Sells', 'productVariantId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      table: 'ProductVariants',
      key: 'id',
    },
    onDelete: 'restrict',
    onUpdate: 'cascade',
  })

  await queryInterface.addColumn('Sells', 'movementIds', {
    type: DataTypes.TEXT,
    allowNull: true,
  })
}

export async function down({ context: { queryInterface } }) {
  await queryInterface.removeColumn('Sells', 'productVariantId')
  await queryInterface.removeColumn('Sells', 'movementIds')
}
