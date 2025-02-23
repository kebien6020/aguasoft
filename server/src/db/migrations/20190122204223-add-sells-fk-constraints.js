// @ts-check
const CLIENT_FKEY = 'Sells_clientId_fk'
const PRODUCT_FKEY = 'Sells_productId_fk'
const USER_FKEY = 'Sells_userId_fk'

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} _Sequelize
 * @return {Promise<void>}
 */
export function up(queryInterface, _Sequelize) {
  const commonOptions = /** @type {const} */ ({
    type: 'foreign key',
    // Can't delete a client, product or user unless all sells
    // for it/them are deleted
    onDelete: 'restrict',
    onUpdate: 'cascade',
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

  const userOptions = {
    ...commonOptions,
    name: USER_FKEY,
    references: {
      table: 'Users',
      field: 'id',
    },
    fields: ['userId'],
  }

  const sequelize = queryInterface.sequelize

  return sequelize.transaction(async (transaction) => {
    await queryInterface.addConstraint('Sells', { transaction, ...clientOptions })
    await queryInterface.addConstraint('Sells', { transaction, ...productOptions })
    await queryInterface.addConstraint('Sells', { transaction, ...userOptions })
  })
}

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} _Sequelize
 * @return {Promise<void>}
 */
export function down(queryInterface, _Sequelize) {
  const sequelize = queryInterface.sequelize

  return sequelize.transaction(async t => {
    await queryInterface.removeConstraint('Sells', PRODUCT_FKEY, { transaction: t })
    await queryInterface.removeConstraint('Sells', CLIENT_FKEY, { transaction: t })
    await queryInterface.removeConstraint('Sells', USER_FKEY, { transaction: t })
  })
}
