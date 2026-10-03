export async function up({ context: { queryInterface, DataTypes } }) {
  return queryInterface.createTable('InventoryElements', {
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
    type: {
      type: DataTypes.ENUM('raw', 'product', 'tool'),
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
  }).then(() => {
    return queryInterface.bulkInsert('InventoryElements', [
      {
        code: 'paca-360',
        name: 'Paca 360',
        type: 'product',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'bolsa-6l',
        name: 'Bolsa 6L',
        type: 'product',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'botellon',
        name: 'Botellon',
        type: 'product',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'hielo-5kg',
        name: 'Hielo 5Kg',
        type: 'product',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'botellon-nuevo',
        name: 'Botellon Nuevo',
        type: 'product',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'base-botellon',
        name: 'Base Botellon',
        type: 'product',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'hielo-2kg',
        name: 'Hielo 2Kg',
        type: 'product',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'botella-600ml',
        name: 'Botella 600ml',
        type: 'product',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'bolsa-360-congelada',
        name: 'Bolsa 360 Congelada',
        type: 'product',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'bolsa-6l-raw',
        name: 'Bolsa 6L Insumo',
        type: 'raw',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'bolsa-360',
        name: 'Bolsa 360 Individual',
        type: 'raw',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'bolsa-hielo-5kg',
        name: 'Bolsa Hielo 5Kg',
        type: 'raw',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'rollo-360',
        name: 'Rollo 360',
        type: 'raw',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'tapa-valvula',
        name: 'Tapa Válvula',
        type: 'raw',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'tapa-sencilla',
        name: 'Tapa Sencilla',
        type: 'raw',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'bolsa-reempaque',
        name: 'Bolsa de Reempaque',
        type: 'raw',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'termoencogible',
        name: 'Sello Termoencogible',
        type: 'raw',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'filtro-dgd-500520',
        name: 'Filtro DGD 5005-20',
        type: 'raw',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'filtro-pd1-20',
        name: 'Filtro PD1-20 1 Micron',
        type: 'raw',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'filtro-epm-20',
        name: 'Filtro EPM 20 Carbon Block',
        type: 'raw',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'canasta',
        name: 'Canasta',
        type: 'raw',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'tirilla-medir',
        name: 'Tarro Tirilla de Medir',
        type: 'raw',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'cinta-fechador',
        name: 'Cinta Fechador',
        type: 'raw',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  })
}

export async function down({ context: { queryInterface } }) {
  return queryInterface.dropTable('InventoryElements')
}
