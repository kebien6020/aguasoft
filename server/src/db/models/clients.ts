import { Sequelize, DataTypes, Model, Models, Instance } from 'sequelize'

export interface ClientAttributes {
  name: string
  code: string
  id: number

  // Deafult for the UI selection of "this client pays in cash"
  defaultCash: boolean
}

export type ClientInstance = Instance<ClientAttributes> & ClientAttributes

export type ClientModel = Model<ClientInstance, ClientAttributes>

export default function(sequelize: Sequelize, DataTypes: DataTypes) {
  var Clients = sequelize.define<ClientInstance, ClientAttributes>('Clients', {
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
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    defaultCash: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    }
  });

  Clients.associate = function(models: Models) {
    // associations can be defined here
    Clients.hasMany(models.Sells)
    Clients.hasMany(models.Prices)
  }
  return Clients;
};
