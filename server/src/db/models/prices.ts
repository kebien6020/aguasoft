import { Sequelize, DataTypes, Model, Models, Instance } from 'sequelize'

export interface PriceAttributes {
  value: string
  clientId: number
  productId: number
  name: string
}

export type PriceInstance = Instance<PriceAttributes> & PriceAttributes

export type PriceModel = Model<PriceInstance, PriceAttributes>

export default function (sequelize: Sequelize, DataTypes: DataTypes) {
  var Prices = sequelize.define<PriceInstance, PriceAttributes>('Prices', {
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
  });
  Prices.associate = function(models: Models) {
    // associations can be defined here
    Prices.belongsTo(models.Clients)
    Prices.belongsTo(models.Products)
  }
  return Prices;
};
