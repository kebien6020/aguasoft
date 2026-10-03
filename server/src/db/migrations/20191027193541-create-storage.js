export async function up({ context: { queryInterface, DataTypes } }) {
  await queryInterface.createTable('Storages', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    deletedAt: {
      type: DataTypes.DATE,
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

export async function down({ context: { queryInterface } }) {
  return queryInterface.dropTable('Storages')
}
