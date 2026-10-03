export async function up({ context: { queryInterface, DataTypes } }) {
  return queryInterface.addColumn('InventoryMovements', 'rollback', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
}

export async function down({ context: { queryInterface } }) {
  return queryInterface.removeColumn('InventoryMovements', 'rollback')
}
