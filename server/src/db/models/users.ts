import { Sequelize, DataTypes, Model } from 'sequelize'
import { ModelStatic } from '../type-utils'

export interface User extends Model {
  name: string
  code: string
  password: string
  role: string
}

export type UserStatic = ModelStatic<User>

export default function makeUsers(sequelize: Sequelize) {
  const Users = <UserStatic> sequelize.define('Users', {
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
    role: {
      type: DataTypes.ENUM('seller', 'admin'),
      allowNull: false,
      defaultValue: 'seller',
    },
  },
  {
    paranoid: true,
  });
  return Users;
};
