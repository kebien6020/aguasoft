export async function up({ context: { queryInterface, DataTypes } }) {
  await queryInterface.createTable('Batches', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    expirationDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    batchCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        table: 'BatchCategories',
        key: 'id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  })
  await queryInterface.addConstraint('Batches', {
    type: 'unique',
    fields: ['date', 'batchCategoryId'],
  })
}

export async function down({ context: { queryInterface } }) {
  return queryInterface.dropTable('Batches')
}
