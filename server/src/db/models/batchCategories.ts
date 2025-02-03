import { Sequelize, DataTypes, Model } from 'sequelize'
import { ModelStatic } from '../type-utils'

export interface BatchCategory extends Model {
  readonly id: number
  readonly code: string
  readonly name: string
  readonly expirationDays: number

  readonly createdAt: Date
  readonly updatedAt: Date
  readonly deletedAt: Date | null
}

export type BatchCategoryStatic = ModelStatic<BatchCategory>

export default function (sequelize: Sequelize) {
  const BatchCategories = <BatchCategoryStatic> sequelize.define('BatchCategories', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expirationDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    paranoid: true,
  })

  return BatchCategories
}
