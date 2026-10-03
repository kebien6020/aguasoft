export function up({ context: { queryInterface, DataTypes } }) {
  return queryInterface.addColumn('Clients', 'defaultCash', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
}

export function down({ context: { queryInterface } }) {
  return queryInterface.removeColumn('Clients', 'defaultCash')
}
