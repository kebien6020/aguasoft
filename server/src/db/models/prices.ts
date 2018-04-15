import { Sequelize, DataTypes, Model, Models, Instance } from 'sequelize'

export interface PriceAttributes {
  value: string
  clientId: string
  productId: string
}

export type PriceInstance = Instance<PriceAttributes> & PriceAttributes

export type PriceModel = Model<PriceInstance, PriceAttributes>

export default function (sequelize: Sequelize, DataTypes: DataTypes) {
  var Prices = sequelize.define<PriceInstance, PriceAttributes>('Prices', {
    value: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
    },
  }, {
    classMethods: {
      associate: function(models: Models) {
        // associations can be defined here
        Prices.belongsTo(models.Clients)
        Prices.belongsTo(models.Products)
      }
    }
  });
  return Prices;
};