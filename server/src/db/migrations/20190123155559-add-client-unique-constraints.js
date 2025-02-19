const NAME_UNIQUE = 'Clients_name_unique'
const CODE_UNIQUE = 'Clients_code_unique'

const addCommon = (obj = {}) => Object.assign(obj, {
  logging: false,
})

const raw = addCommon({ raw: true })

export function up(queryInterface, Sequelize) {
  const sequelize = queryInterface.sequelize

  const nameOptions = addCommon({
    type: 'unique',
    name: NAME_UNIQUE,
  })

  const codeOptions = addCommon({
    type: 'unique',
    name: CODE_UNIQUE,
  })

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
  ).then(() => queryInterface.addConstraint('Clients', ['name'], nameOptions),
  ).then(() => queryInterface.addConstraint('Clients', ['code'], codeOptions),
  ).then(() => sequelize.query('COMMIT;', raw),
  ).catch(() => sequelize.query('ROLLBACK;', raw),
  )
}
export function down(queryInterface, Sequelize) {
  const sequelize = queryInterface.sequelize
  return sequelize.query('PRAGMA foreign_keys = OFF;', raw).then(() => sequelize.query('BEGIN TRANSACTION;', raw),
  ).then(() => sequelize.query('PRAGMA defer_foreign_keys = ON;', raw),
  ).then(() => queryInterface.removeConstraint('Clients', NAME_UNIQUE, addCommon()),
  ).then(() => queryInterface.removeConstraint('Clients', CODE_UNIQUE, addCommon()),
  ).then(() => sequelize.query('COMMIT;', raw),
  ).catch(() => sequelize.query('ROLLBACK;', raw),
  )
}
