// @ts-check
/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} Sequelize
 * @return {Promise<void>}
 */
export async function up(queryInterface, Sequelize) {
  await queryInterface.changeColumn('Prices', 'clientId', {
    type: Sequelize.INTEGER,
    allowNull: true,
  })
}

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} Sequelize
 * @return {Promise<void>}
 */
export async function down(queryInterface, Sequelize) {
  await queryInterface.changeColumn('Prices', 'clientId', {
    type: Sequelize.INTEGER,
    allowNull: false,
  })
}
