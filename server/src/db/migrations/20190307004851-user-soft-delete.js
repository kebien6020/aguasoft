'use strict';

const { fkValidationsDeferred } = require('../migration-utils')
const options = {logging: console.log}

module.exports = {
  up: (queryInterface, Sequelize) => {
    return fkValidationsDeferred(queryInterface, options, () =>
      queryInterface.addColumn('Users', 'deletedAt', {
        type: Sequelize.DATE,
      }, options)
    )
  },

  down: (queryInterface, Sequelize) => {
    // Remove column currently drops all constraints from the table schema.
    // Not the end of the world but prefer not to undo this migration, instead
    // restore database from backup if possible
    return fkValidationsDeferred(queryInterface, options, () =>
      queryInterface.removeColumn('Users', 'deletedAt', options)
    )
  }
};
