'use strict';

const CODE_CK = 'Prices_code_noempty'
const NAME_CK = 'Prices_name_noempty'

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { ne } = Sequelize.Op
    const commonOptions = {
      type: 'check',
      logging: console.log,
    }

    const checkNoEmptyCode = Object.assign({}, commonOptions, {
      name: CODE_CK,
      where: {
        code: { [ne]: '' },
      },
    })

    const checkNoEmptyName = Object.assign({}, commonOptions, {
      name: NAME_CK,
      where: {
        name: { [ne]: '' },
      },
    })

    const sequelize = queryInterface.sequelize
    const trans = (t, obj) => Object.assign(obj, {transaction: t})
    return sequelize.transaction(t =>
      queryInterface.addConstraint('Clients', ['code'], trans(t, checkNoEmptyCode)).then(() =>
        queryInterface.addConstraint('Clients', ['name'], trans(t, checkNoEmptyName))
      )
    )
  },

  down: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize

    return sequelize.transaction(t =>
      queryInterface.removeConstraint('Clients', NAME_CK, {transaction: t}).then(() =>
        queryInterface.removeConstraint('Clients', CODE_CK, {transaction: t})
      )
    )
  }
};
