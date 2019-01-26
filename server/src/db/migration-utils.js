function fkValidationsDeferred(queryInterface, options, callback) {
  if (!options) {
    options = {}
  }

  options = Object.assign({}, options, {
    raw: true
  })

  const sequelize = queryInterface.sequelize

  // We need set foreign_keys to off before starting the transaction because
  // it is a no-op during a transaction
  // NOTE: This pragma is SQLite specific and resets on new connection
  return sequelize.query('PRAGMA foreign_keys = OFF;', options).then(() =>
    // Sequelize transactions run in a different connection, and the previous
    // directive only affects the current connection and is only
    // valid during the connection it is started in
    sequelize.query('BEGIN TRANSACTION;', options)
  ).then(() =>
    // This pragma is SQLite specific, it auto switches off on COMMIT
    sequelize.query('PRAGMA defer_foreign_keys = ON;', options)
  ).then(() =>
    callback()
  ).then(() =>
    sequelize.query('COMMIT;', options)
  ).catch(() =>
    sequelize.query('ROLLBACK;', options)
  )
}

module.exports = {
  fkValidationsDeferred,
}
