'use strict';

const CLIENT_FKEY = 'fkey_clientId'
const PRODUCT_FKEY = 'fkey_productId'

module.exports = {
  up: (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize

    return sequelize.transaction(t => {
      const addCommon = (obj = {}) => Object.assign(obj, {
        // This migration is critical so I want to see every query executed
        logging: console.log,
        transaction: t,
      })

      const addFKeyOpts = (obj = {}) => Object.assign(obj, addCommon({
        type: 'foreign key',
        // Prices must be deleted manually before deleting a client
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }))

      const clientOptions = addFKeyOpts({
        name: CLIENT_FKEY,
        references: {
          table: 'Clients',
          field: 'id',
        },
      })

      const productOptions = addFKeyOpts({
        name: PRODUCT_FKEY,
        references: {
          table: 'Products',
          field: 'id',
        },
      })

      const trans = (t, obj) => Object.assign(obj, {transaction: t})

      return queryInterface.removeConstraint('Prices', PRODUCT_FKEY, addCommon()
      ).then(() =>
        queryInterface.removeConstraint('Prices', CLIENT_FKEY, addCommon())
      ).then(() =>
        queryInterface.addConstraint('Prices', ['clientId'], clientOptions)
      ).then(() =>
        queryInterface.addConstraint('Prices', ['productId'], productOptions)
      )
    })
  },

  down: (queryInterface, Sequelize) => {
    // Not reversing this query should not cause any problems since
    // the constraints still exist and are called the same
  }
};