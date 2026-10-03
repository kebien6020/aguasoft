import { Op } from '@sequelize/core'
const CODE_CK = 'Clients_code_noempty'
const NAME_CK = 'Clients_name_noempty'

const addCommon = (obj = {}) => Object.assign(obj, {
  logging: false,
})

const raw = addCommon({ raw: true })

export async function up({ context: { queryInterface } }) {
  const checkNoEmptyCode = addCommon({
    type: 'check',
    name: CODE_CK,
    where: {
      code: { [Op.ne]: '' },
    },
  })

  const checkNoEmptyName = addCommon({
    type: 'check',
    name: NAME_CK,
    where: {
      name: { [Op.ne]: '' },
    },
  })

  const sequelize = queryInterface.sequelize

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
  ).then(() => queryInterface.addConstraint('Clients', ['code'], checkNoEmptyCode),
  ).then(() => queryInterface.addConstraint('Clients', ['name'], checkNoEmptyName),
  ).then(() => sequelize.query('COMMIT;', raw),
  ).catch(() => sequelize.query('ROLLBACK;', raw),
  )
}

export async function down({ context: { queryInterface, sequelize } }) {
  try {
    await sequelize.query('PRAGMA foreign_keys = OFF;', raw)
    await sequelize.query('BEGIN TRANSACTION;', raw)
    await sequelize.query('PRAGMA defer_foreign_keys = ON;', raw)
    await queryInterface.removeConstraint('Clients', NAME_CK, addCommon())
    await queryInterface.removeConstraint('Clients', CODE_CK, addCommon())
    await sequelize.query('COMMIT;', raw)
  } catch (e) {
    sequelize.query('ROLLBACK;', raw)
  }
}
