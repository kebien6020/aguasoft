import { Sequelize, DataTypes, Model } from 'sequelize'
import { ModelStatic } from '../type-utils'
import { Product } from './products'

export interface ProductVariantAttributes {
  readonly id: number
  readonly productId: number
  readonly code: string
  readonly name: string
  readonly basePrice: string
}

export interface ProductVariant extends ProductVariantAttributes, Model {
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly deletedAt: Date | null

  // Possible inclussions
  readonly Product?: Product
}

export type ProductVariantStatic = ModelStatic<ProductVariant>

export default function (sequelize: Sequelize): ProductVariantStatic {
  const ProductVariants = <ProductVariantStatic> sequelize.define('ProductVariants', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Products',
        key: 'id',
      },
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    basePrice: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
    },
  }, {
    paranoid: true,
  })

  ProductVariants.associate = models => {
    ProductVariants.belongsTo(models.Products)
  }

  return ProductVariants
}
