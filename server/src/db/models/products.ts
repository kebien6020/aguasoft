import { Sequelize, DataTypes, Model, Models, Instance } from 'sequelize'

export interface ProductAttributes {
  name: string
  code: string
  basePrice: string
  id: number
}

export type ProductInstance = Instance<ProductAttributes> & ProductAttributes

export type ProductModel = Model<ProductInstance, ProductAttributes>

export default function (sequelize: Sequelize, DataTypes: DataTypes) {
  var Products = sequelize.define<ProductInstance, ProductAttributes>('Products', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
    },
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
  });

  Products.associate = function(models: Models) {
    // associations can be defined here
    Products.hasMany(models.Sells)
  }
  return Products;
};
