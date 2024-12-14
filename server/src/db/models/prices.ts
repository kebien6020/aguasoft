import { Sequelize, DataTypes, Model } from 'sequelize'
import { ModelStatic } from '../type-utils'

export interface Price extends Model {
  readonly value: string

  readonly clientId: number

  readonly productId: number

  readonly name: string
}

export type PriceStatic = ModelStatic<Price>

export default function(sequelize: Sequelize) {
  const Prices = <PriceStatic>sequelize.define('Prices', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    value: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Base',
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  })
  Prices.associate = function(models) {
    // associations can be defined here
    Prices.belongsTo(models.Clients)
    Prices.belongsTo(models.Products)
  }
  return Prices
}
