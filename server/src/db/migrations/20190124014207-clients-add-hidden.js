'use strict'

const addCommon = (obj = {}) => Object.assign(obj, {
  logging: false,
})

const raw = addCommon({ raw: true })

module.exports = {
  up: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize

    const hiddenColumn = {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }
    // Adding the column doesn't need all this nonsense but the undo does need
    // it, hence I leave this as it is for consistency

    // We need set foreign_keys to off before starting the transaction because
    // it is a no-op during a transaction
    // NOTE: This pragma is SQLite specific and resets on new connection
    return sequelize.query('PRAGMA foreign_keys = OFF;', raw).then(() =>

      // Sequelize transactions run in a different connection, and the previous
      // directive only affects the current connection and is only
      // valid during the connection it is started in
      sequelize.query('BEGIN TRANSACTION;', raw),
    ).then(() =>
      // This pragma is SQLite specific, it auto switches off on COMMIT
      sequelize.query('PRAGMA defer_foreign_keys = ON;', raw),
    ).then(() =>
      queryInterface.addColumn('Clients', 'hidden', hiddenColumn, addCommon()),
    ).then(() =>
      sequelize.query('COMMIT;', raw),
    ).catch(() =>
      sequelize.query('ROLLBACK;', raw),
    )
  },

  down: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize
    return sequelize.query('PRAGMA foreign_keys = OFF;', raw).then(() =>
      sequelize.query('BEGIN TRANSACTION;', raw),
    ).then(() =>
      sequelize.query('PRAGMA defer_foreign_keys = ON;', raw),
    ).then(() =>
      queryInterface.removeColumn('Clients', 'hidden', addCommon()),
    ).then(() =>
      sequelize.query('COMMIT;', raw),
    ).catch(() =>
      sequelize.query('ROLLBACK;', raw),
    )
  },
}
