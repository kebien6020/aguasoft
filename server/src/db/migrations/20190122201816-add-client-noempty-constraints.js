'use strict';

const CODE_CK = 'Clients_code_noempty'
const NAME_CK = 'Clients_name_noempty'

const addCommon = (obj = {}) => Object.assign(obj, {
  logging: console.log,
})

const raw = addCommon({raw: true})

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { ne } = Sequelize.Op

    const checkNoEmptyCode = addCommon({
      type: 'check',
      name: CODE_CK,
      where: {
        code: { [ne]: '' },
      },
    })

    const checkNoEmptyName = addCommon({
      type: 'check',
      name: NAME_CK,
      where: {
        name: { [ne]: '' },
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
      sequelize.query('BEGIN TRANSACTION;', raw)
    ).then(() =>
      // This pragma is SQLite specific, it auto switches off on COMMIT
      sequelize.query('PRAGMA defer_foreign_keys = ON;', raw)
    ).then(() =>
      queryInterface.addConstraint('Clients', ['code'], checkNoEmptyCode)
    ).then(() =>
      queryInterface.addConstraint('Clients', ['name'], checkNoEmptyName)
    ).then(() =>
      sequelize.query('COMMIT;', raw)
    ).catch(() =>
      sequelize.query('ROLLBACK;', raw)
    )
  },

  down: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize
    return sequelize.query('PRAGMA foreign_keys = OFF;', raw).then(() =>
      sequelize.query('BEGIN TRANSACTION;', raw)
    ).then(() =>
      sequelize.query('PRAGMA defer_foreign_keys = ON;', raw)
    ).then(() =>
      queryInterface.removeConstraint('Clients', NAME_CK, addCommon())
    ).then(() =>
      queryInterface.removeConstraint('Clients', CODE_CK, addCommon())
    ).then(() =>
      sequelize.query('COMMIT;', raw)
    ).catch(() =>
      sequelize.query('ROLLBACK;', raw)
    )
  }
};
