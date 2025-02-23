// @ts-check
import { fkValidationsDeferred } from '../migration-utils.js'
const options = {}

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} Sequelize
 * @return {Promise<void>}
 */
export async function up(queryInterface, Sequelize) {
  await fkValidationsDeferred(queryInterface, options, async () => {
    await queryInterface.addColumn('Users', 'deletedAt', {
      type: Sequelize.DATE,
    }, options)
  })
}

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} _Sequelize
 * @return {Promise<void>}
 */
export async function down(queryInterface, _Sequelize) {
  // Remove column currently drops all constraints from the table schema.
  // Not the end of the world but prefer not to undo this migration, instead
  // restore database from backup if possible
  await fkValidationsDeferred(queryInterface, options, async () => {
    await queryInterface.removeColumn('Users', 'deletedAt', options)
  })
}
