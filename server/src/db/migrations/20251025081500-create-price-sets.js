export async function up({ context: { queryInterface, DataTypes } }) {
  await queryInterface.createTable('PriceSets', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deletedAt: {
      allowNull: true,
      type: DataTypes.DATE,
    },
  })
}

export async function down({ context: { queryInterface } }) {
  await queryInterface.dropTable('PriceSets')
}
