import { Sequelize, DataTypes, Model, Models, Instance } from 'sequelize'

export interface ClientAttributes {
  name: string
  code: string
}

export type ClientInstance = Instance<ClientAttributes> & ClientAttributes

export type ClientModel = Model<ClientInstance, ClientAttributes>

export default function(sequelize: Sequelize, DataTypes: DataTypes) {
  var Clients = sequelize.define<ClientInstance, ClientAttributes>('Clients', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    classMethods: {
      associate: function(models: Models) {
        // associations can be defined here
      }
    }
  });
  return Clients;
};
