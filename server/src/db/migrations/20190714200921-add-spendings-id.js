'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    // Can't add a column as primaryKey so first create plain old column
    // and then change since sequelize uses an intermediate table
    // for changes
    // See https://github.com/sequelize/sequelize/blob/4478d74a3e5dc8cd30837d8a193754867d06ccf5/lib/dialects/sqlite/query-interface.js#L44

    const sequelize = queryInterface.sequelize
    return sequelize.transaction(t => {
      const opts = (obj = {}) => Object.assign(obj, {
        transaction: t,
      })
      return queryInterface.addColumn('Spendings', 'id', Sequelize.INTEGER, opts())
        .then(() =>
          queryInterface.changeColumn('Spendings', 'id', {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
          }, opts()),
        )
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Spendings', 'id')
  },
}
