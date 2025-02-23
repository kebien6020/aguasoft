// @ts-check
/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} Sequelize
 * @return {Promise<unknown>}
 */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Storages', {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    deletedAt: {
      type: Sequelize.DATE,
    },
  })
  return await queryInterface.bulkInsert('Storages', [
    {
      code: 'bodega',
      name: 'Bodega',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      code: 'trabajo',
      name: 'Area de Trabajo',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      code: 'intermedia',
      name: 'Area de Empaque',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      code: 'terminado',
      name: 'Producto Terminado',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])
}

/**
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {typeof import('sequelize').Sequelize & typeof import('sequelize').DataTypes} _Sequelize
 * @return {Promise<unknown>}
 */
export function down(queryInterface, _Sequelize) {
  return queryInterface.dropTable('Storages')
}
