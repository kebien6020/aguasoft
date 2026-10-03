export async function up({ context: { queryInterface, DataTypes } }) {
  return queryInterface.addColumn('Sells', 'deleted', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
}

export function down({ context: { queryInterface } }) {
  return queryInterface.removeColumn('Sells', 'deleted')
}
