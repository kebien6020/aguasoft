export async function up({ context: { queryInterface, DataTypes, sequelize } }) {
  // Can't add a column as primaryKey so first create plain old column
  // and then change since sequelize uses an intermediate table
  // for changes
  // See https://github.com/sequelize/sequelize/blob/4478d74a3e5dc8cd30837d8a193754867d06ccf5/lib/dialects/sqlite/query-interface.js#L44
  return sequelize.transaction(t => {
    const opts = (obj = {}) => Object.assign(obj, {
      transaction: t,
    })
    return queryInterface.addColumn('Spendings', 'id', DataTypes.INTEGER, opts())
      .then(() => queryInterface.changeColumn('Spendings', 'id', {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      }, opts()),
      )
  })
}

export async function down({ context: { queryInterface } }) {
  return queryInterface.removeColumn('Spendings', 'id')
}
