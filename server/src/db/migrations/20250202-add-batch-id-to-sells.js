export async function up({ context: { queryInterface, DataTypes } }) {
  await queryInterface.addColumn('Sells', 'batchId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      table: 'Batches',
      key: 'id',
    },
    onDelete: 'restrict',
    onUpdate: 'cascade',
  })
}

export async function down({ context: { queryInterface } }) {
  return queryInterface.removeColumn('Sells', 'batchId')
}
