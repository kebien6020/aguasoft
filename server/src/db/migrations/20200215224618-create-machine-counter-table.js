export async function up({ context: { queryInterface, DataTypes } }) {
  return queryInterface.createTable('MachineCounters', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        'production',
        'new-reel',
      ),
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
  })
}

export async function down({ context: { queryInterface } }) {
  return queryInterface.dropTable('MachineCounters')
}
