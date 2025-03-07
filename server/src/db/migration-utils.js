export async function fkValidationsDeferred(queryInterface, options, callback) {
  if (!options)
    options = {}


  options = Object.assign({}, options, {
    raw: true,
  })

  const sequelize = queryInterface.sequelize

  try {
    // We need set foreign_keys to off before starting the transaction because
    // it is a no-op during a transaction
    // NOTE: This pragma is SQLite specific and resets on new connection
    await sequelize.query('PRAGMA foreign_keys = OFF;', options)

    // Sequelize transactions run in a different connection, and the previous
    // directive only affects the current connection and is only
    // valid during the connection it is started in
    await sequelize.query('BEGIN TRANSACTION;', options)

    // This pragma is SQLite specific, it auto switches off on COMMIT
    await sequelize.query('PRAGMA defer_foreign_keys = ON;', options)
    await callback()
    await sequelize.query('COMMIT;', options)
  } catch {
    await sequelize.query('ROLLBACK;', options)
  }
}
