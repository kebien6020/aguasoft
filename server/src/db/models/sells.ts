import { Sequelize, DataTypes, Model, Models, Instance } from 'sequelize'
import { ProductInstance } from './products'
import { ClientInstance } from './clients'

export interface SellAttributes {
  id: number
  date: string
  cash: boolean
  priceOverride: number
  quantity: number
  value: number
  userId: number
  clientId: number
  productId: number
  deleted: boolean

  Product: ProductInstance | undefined
  Client: ClientInstance | undefined
}

export type SellInstance = Instance<SellAttributes> & SellAttributes

export type SellModel = Model<SellInstance, SellAttributes>

export default function (sequelize: Sequelize, DataTypes: DataTypes) {
  var Sells = sequelize.define('Sells', {
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
  });
  Sells.associate = function(models: Models) {
    // associations can be defined here
    Sells.belongsTo(models.Users)
    Sells.belongsTo(models.Clients)
    Sells.belongsTo(models.Products)
  }
  return Sells;
};
