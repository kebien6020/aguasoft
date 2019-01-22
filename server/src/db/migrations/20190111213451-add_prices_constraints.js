'use strict';

const CLIENT_FKEY = 'fkey_clientId'
const PRODUCT_FKEY = 'fkey_productId'

module.exports = {
  up: (queryInterface, Sequelize) => {
    const commonOptions = {
      type: 'foreign key',
      // When deleting clients or products, all the
      // associated prices are deleted
      onDelete: 'cascade',
      onUpdate: 'cascade',
      // This migration is critical so I want to see every query executed
      logging: console.log,
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

    const sequelize = queryInterface.sequelize
    const trans = (t, obj) => Object.assign(obj, {transaction: t})

    return sequelize.transaction(t =>
      queryInterface.addConstraint('Prices', ['clientId'], trans(t, clientOptions)).then(() =>
        queryInterface.addConstraint('Prices', ['productId'], trans(t, productOptions))
      )
    )

  },
  down: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize

    return sequelize.transaction(t =>
      queryInterface.removeConstraint('Prices', PRODUCT_FKEY, {transaction: t}).then(() =>
        queryInterface.removeConstraint('Prices', CLIENT_FKEY, {transaction: t})
      )
    )
  }
};
