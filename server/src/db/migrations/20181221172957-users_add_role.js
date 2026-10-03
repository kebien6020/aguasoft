export async function up({ context: { queryInterface, DataTypes } }) {
  return queryInterface.addColumn('Users', 'role', {
    type: DataTypes.ENUM('seller', 'admin'),
    allowNull: false,
    defaultValue: 'seller',
  })
}

export function down({ context: { queryInterface } }) {
  return queryInterface.removeColumn('Users', 'role')
}
