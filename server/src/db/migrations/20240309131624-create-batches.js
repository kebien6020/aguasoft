// @ts-check
/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} Sequelize
 * @return {Promise<void>}
 */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Batches', {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    expirationDate: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    batchCategoryId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'BatchCategories',
        key: 'id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  })
  await queryInterface.addConstraint('Batches', {
    type: 'unique',
    fields: ['date', 'batchCategoryId'],
  })
}

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} _Sequelize
 * @return {Promise<void>}
 */
export function down(queryInterface) {
  return queryInterface.dropTable('Batches')
}
