import { Sequelize, DataTypes, Model, Models, Instance } from 'sequelize'

export interface ProductAttributes {
  name: string
  code: string
  basePrice: string
}

export type ProductInstance = Instance<ProductAttributes> & ProductAttributes

export type ProductModel = Model<ProductInstance, ProductAttributes>

export default function (sequelize: Sequelize, DataTypes: DataTypes) {
  var Products = sequelize.define<ProductInstance, ProductAttributes>('Products', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    basePrice: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
    },
  }, {
    classMethods: {
      associate: function(models: Models) {
        // associations can be defined here
      }
    }
  });
  return Products;
};
