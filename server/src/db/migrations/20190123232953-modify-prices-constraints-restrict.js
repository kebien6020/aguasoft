const CLIENT_FKEY = 'fkey_clientId'
const PRODUCT_FKEY = 'fkey_productId'

export async function up({ context: { queryInterface } }) {
  const sequelize = queryInterface.sequelize

  return sequelize.transaction(async t => {
    const commonOptions = /** @type {const} */ ({
      type: 'foreign key',
      // Prices must be deleted manually before deleting a client
      onDelete: 'restrict',
      onUpdate: 'cascade',
      transaction: t,
    })

    const clientOptions = {
      ...commonOptions,
      name: CLIENT_FKEY,
      references: {
        table: 'Clients',
        field: 'id',
      },
      fields: ['clientId'],
    }

    const productOptions = {
      ...commonOptions,
      name: PRODUCT_FKEY,
      references: {
        table: 'Products',
        field: 'id',
      },
      fields: ['productId'],
    }

    await queryInterface.removeConstraint('Prices', PRODUCT_FKEY, { transaction: t })
    await queryInterface.removeConstraint('Prices', CLIENT_FKEY, { transaction: t })
    await queryInterface.addConstraint('Prices', clientOptions)
    await queryInterface.addConstraint('Prices', productOptions)
  })
}

export async function down() {
  // Not reversing this query should not cause any problems since
  // the constraints still exist and are called the same
}
