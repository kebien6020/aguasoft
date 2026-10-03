export async function up({ context: { queryInterface, DataTypes } }) {
  await queryInterface.addColumn('Products', 'batchCategoryId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      table: 'BatchCategories',
      key: 'id',
    },
    onDelete: 'restrict',
    onUpdate: 'cascade',
  })
}

export async function down({ context: { queryInterface } }) {
  return queryInterface.removeColumn('Products', 'batchCategoryId')
}
