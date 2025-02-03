import { Sequelize, DataTypes, Model } from 'sequelize'
import type { ModelStatic } from '../type-utils'
import type { BatchCategory } from './batchCategories'

export interface Batch extends Model {
  readonly id: number
  readonly code: string
  readonly date: Date
  readonly expirationDate: Date
  readonly batchCategoryId: number

  readonly createdAt: Date
  readonly updatedAt: Date

  // Possible inclusions
  readonly BatchCategory?: BatchCategory
}

export type BatchStatic = ModelStatic<Batch>

export default function(sequelize: Sequelize) {
  const Batches = <BatchStatic>sequelize.define('Batches', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    expirationDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    batchCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'BatchCategories',
        key: 'id',
      },
    },
  }, {})

  Batches.associate = function(models) {
    Batches.belongsTo(models.BatchCategories)
  }

  return Batches
}
