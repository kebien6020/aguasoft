import { Sequelize, DataTypes, Model } from 'sequelize'
import { ModelStatic } from './type-utils'

export interface Product extends Model {
  readonly name: string

  readonly code: string

  readonly basePrice: string

  readonly id: number
}

export type ProductStatic = ModelStatic<Product>

export default function (sequelize: Sequelize) {
  var Products = <ProductStatic> sequelize.define('Products', {
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
    basePrice: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
    },
  });

  Products.associate = function(models) {
    // associations can be defined here
    Products.hasMany(models.Sells)
  }
  return Products;
};
