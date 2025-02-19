// @ts-check
/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} Sequelize
 * @return {Promise<void>}
 */
export function up(queryInterface, Sequelize) {
  return queryInterface.createTable('Sessions', {
    sid: {
      primaryKey: true,
      type: Sequelize.STRING,
    },
    userId: {
      type: Sequelize.STRING,
    },
    expires: {
      type: Sequelize.DATE,
    },
    data: {
      type: Sequelize.STRING(50000),
    },
  })
}

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} _Sequelize
 * @return {Promise<void>}
 */
export function down(queryInterface, _Sequelize) {
  return queryInterface.dropTable('Sessions')
}
