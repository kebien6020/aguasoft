import { Op } from '@sequelize/core'
import { fkValidationsDeferred } from '../migration-utils.js'

const options = {}

export async function up({ context: { queryInterface, DataTypes } }) {

  await fkValidationsDeferred(queryInterface, options, async () => {
    await queryInterface.addColumn('Clients', 'notes', { type: DataTypes.TEXT }, options)

    // Empty notes are just confusing, they can be either null or not-empty
    await queryInterface.addConstraint('Clients', {
      type: 'check',
      name: 'Clients_notes_noempty',
      where: {
        notes: { [Op.ne]: '' },
      },
      fields: ['notes'],
    })
  })
}

export async function down({ context: { queryInterface } }) {
  // Remove column currently drops all constraints from the table schema.
  // Not the end of the word but prefer not to undo this migration, instead
  // restore database from backup if possible
  return fkValidationsDeferred(queryInterface, options, () => queryInterface.removeColumn('Clients', 'notes', options),
  )
}
