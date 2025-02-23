// @ts-check
import { Op } from 'sequelize'
import { fkValidationsDeferred } from '../migration-utils.js'

const options = {}

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} Sequelize
 * @return {Promise<void>}
 */
export async function up(queryInterface, Sequelize) {

  await fkValidationsDeferred(queryInterface, options, async () => {
    await queryInterface.addColumn('Clients', 'notes', { type: Sequelize.TEXT }, options)

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

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} _Sequelize
 * @return {Promise<void>}
 */
export function down(queryInterface, _Sequelize) {
  // Remove column currently drops all constraints from the table schema.
  // Not the end of the word but prefer not to undo this migration, instead
  // restore database from backup if possible
  return fkValidationsDeferred(queryInterface, options, () => queryInterface.removeColumn('Clients', 'notes', options),
  )
}
