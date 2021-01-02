'use strict'

const { fkValidationsDeferred } = require('../migration-utils')

const options = {}

module.exports = {
  up: (queryInterface, Sequelize) => {

    const { ne } = Sequelize.Op

    return fkValidationsDeferred(queryInterface, options, () =>
      queryInterface.addColumn('Clients', 'notes', {
        type: Sequelize.TEXT,
      }, options).then(() =>
        // Empty notes are just confusing, they can be either null or not-empty
        queryInterface.addConstraint('Clients', ['notes'], {
          type: 'check',
          name: 'Clients_notes_noempty',
          where: {
            notes: { [ne]: '' },
          },
        }),
      ),
    )
  },

  down: (queryInterface, Sequelize) => {
    // Remove column currently drops all constraints from the table schema.
    // Not the end of the word but prefer not to undo this migration, instead
    // restore database from backup if possible
    return fkValidationsDeferred(queryInterface, options, () =>
      queryInterface.removeColumn('Clients', 'notes', options),
    )
  },
}
