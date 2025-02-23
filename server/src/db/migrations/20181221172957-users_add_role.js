// @ts-check
/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} Sequelize
 * @return {Promise<void>}
 */
export function up(queryInterface, Sequelize) {
  return queryInterface.addColumn('Users', 'role', {
    type: Sequelize.ENUM('seller', 'admin'),
    allowNull: false,
    defaultValue: 'seller',
  })
}

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} _Sequelize
 * @return {Promise<void>}
 */
export function down(queryInterface, _Sequelize) {
  return queryInterface.removeColumn('Users', 'role')
}
