import { Sequelize, DataTypes, Model, Op } from 'sequelize'
import { ModelStatic } from '../type-utils'
import { Product } from './products'
import { Client } from './clients'

export interface SellAttriutes {
  readonly id: number
  readonly date: string
  readonly cash: boolean
  readonly priceOverride: number
  readonly quantity: number
  readonly value: number
  readonly userId: number
  readonly clientId: number
  readonly productId: number
  readonly deleted: boolean
}

export interface Sell extends SellAttriutes, Model {

  // Possible inclussions
  readonly Product?: Product
  readonly Client?: Client
}

export type SellStatic = ModelStatic<Sell>

export default function(sequelize: Sequelize): SellStatic {
  const Sells = <SellStatic>sequelize.define('Sells', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    cash: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    priceOverride: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      defaultValue: null,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    value: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    defaultScope: {
      where: {
        [Op.or]: [
          { date: { [Op.lt]: '2022-09-01' } },
          { date: { [Op.gt]: '2022-10-09' } },
          { productId: { [Op.ne]: 5 } },
        ],
      },
    },
  })
  Sells.associate = function(models) {
    // associations can be defined here
    Sells.belongsTo(models.Users)
    Sells.belongsTo(models.Clients)
    Sells.belongsTo(models.Products)
  }
  return Sells
}
