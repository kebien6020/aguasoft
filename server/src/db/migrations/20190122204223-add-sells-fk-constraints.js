'use strict'

const CLIENT_FKEY = 'Sells_clientId_fk'
const PRODUCT_FKEY = 'Sells_productId_fk'
const USER_FKEY = 'Sells_userId_fk'

module.exports = {
  up: (queryInterface, Sequelize) => {
    const commonOptions = {
      type: 'foreign key',
      // Can't delete a client, product or user unless all sells
      // for it/them are deleted
      onDelete: 'restrict',
      onUpdate: 'cascade',
    }

    const clientOptions = Object.assign({}, commonOptions, {
      name: CLIENT_FKEY,
      references: {
        table: 'Clients',
        field: 'id',
      },
    })

    const productOptions = Object.assign({}, commonOptions, {
      name: PRODUCT_FKEY,
      references: {
        table: 'Products',
        field: 'id',
      },
    })

    const userOptions = Object.assign({}, commonOptions, {
      name: USER_FKEY,
      references: {
        table: 'Users',
        field: 'id',
      },
    })

    const sequelize = queryInterface.sequelize
    const trans = (t, obj) => Object.assign(obj, { transaction: t })

    return sequelize.transaction(t =>
      queryInterface.addConstraint('Sells', ['clientId'], trans(t, clientOptions)).then(() =>
        queryInterface.addConstraint('Sells', ['productId'], trans(t, productOptions)),
      ).then(() =>
        queryInterface.addConstraint('Sells', ['userId'], trans(t, userOptions)),
      ),
    )
  },

  down: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize

    return sequelize.transaction(t =>
      queryInterface.removeConstraint('Sells', PRODUCT_FKEY, { transaction: t }).then(() =>
        queryInterface.removeConstraint('Sells', CLIENT_FKEY, { transaction: t }),
      ).then(() =>
        queryInterface.removeConstraint('Sells', USER_FKEY, { transaction: t }),
      ),
    )
  },
}
