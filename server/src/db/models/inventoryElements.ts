import { Sequelize, DataTypes, Model } from 'sequelize'
import { ModelStatic } from '../type-utils'

export interface InventoryElement extends Model {
  readonly id: number
  readonly code: string
  readonly name: string
  readonly type: 'raw' | 'product' | 'tool'

  readonly createdAt: Date
  readonly updatedAt: Date
  readonly deletedAt: Date | null
}

export type InventoryElementStatic = ModelStatic<InventoryElement>

export default function (sequelize: Sequelize) {
  const InventoryElements = <InventoryElementStatic> sequelize.define('InventoryElements', {
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
    type: {
      type: DataTypes.ENUM('raw', 'product', 'tool'),
      allowNull: false,
    },
  }, {
    paranoid: true,
  })

  return InventoryElements;
}
