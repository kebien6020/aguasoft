import { fkValidationsDeferred } from '../migration-utils.js'
const options = {}

export async function up({ context: { queryInterface, DataTypes } }) {
  await fkValidationsDeferred(queryInterface, options, async () => {
    await queryInterface.addColumn('Users', 'deletedAt', {
      type: DataTypes.DATE,
    }, options)
  })
}

export async function down({ context: { queryInterface } }) {
  // Remove column currently drops all constraints from the table schema.
  // Not the end of the world but prefer not to undo this migration, instead
  // restore database from backup if possible
  await fkValidationsDeferred(queryInterface, options, async () => {
    await queryInterface.removeColumn('Users', 'deletedAt', options)
  })
}
