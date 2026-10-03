export function up({ context: { queryInterface, DataTypes } }) {
  return queryInterface.createTable('Sessions', {
    sid: {
      primaryKey: true,
      type: DataTypes.STRING,
    },
    userId: {
      type: DataTypes.STRING,
    },
    expires: {
      type: DataTypes.DATE,
    },
    data: {
      type: DataTypes.STRING(50000),
    },
  })
}

export function down({ context: { queryInterface } }) {
  return queryInterface.dropTable('Sessions')
}
