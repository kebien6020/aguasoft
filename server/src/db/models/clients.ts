import { Sequelize, DataTypes, Model } from 'sequelize'
import { ModelStatic } from './type-utils'

export interface Client extends Model {

  readonly name: string

  readonly code: string

  readonly id: number

  // Deafult for the UI selection of "this client pays in cash"
  readonly defaultCash: boolean

  readonly hidden: boolean

  readonly notes: string
}

export type ClientStatic = ModelStatic<Client>

export default function(sequelize: Sequelize) {
  const Clients = <ClientStatic> sequelize.define('Clients', {
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
    },
    hidden: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    notes: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
  });

  Clients.associate = function(models) {
    // associations can be defined here
    Clients.hasMany(models.Sells)
    Clients.hasMany(models.Prices, { foreignKey: 'clientId' })
  }
  return Clients;
};
