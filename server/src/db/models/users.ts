import { Sequelize, DataTypes, Model, Models, Instance } from 'sequelize'

export interface UserAttributes {
  name: string
  code: string
  password: string
}

export type UserInstance = Instance<UserAttributes> & UserAttributes

export type UserModel = Model<UserInstance, UserAttributes>

export default function makeUsers(sequelize: Sequelize, DataTypes: DataTypes) {
  const Users = sequelize.define<UserInstance, UserAttributes>('Users', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
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
  return Users;
};
