import { Sequelize, DataTypes, Model } from 'sequelize'
import { ModelStatic } from '../type-utils'
import { Storage } from './storages'
import { InventoryElement } from './inventoryElements'

import {
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
} from 'sequelize'

export interface StorageState extends Model {
  readonly storageId: number
  readonly inventoryElementId: number
  readonly quantity: string

  // timestamps
  readonly createdAt: Date
  readonly updatedAt: Date

  // Possible inclusions
  readonly storage?: Storage
  readonly inventoryElement?: InventoryElement

  // Methods added when performing associations
  getStorage: BelongsToGetAssociationMixin<Storage>
  setStorage: BelongsToSetAssociationMixin<Storage, number>
  getInventoryElement: BelongsToGetAssociationMixin<InventoryElement>
  setInventoryElement: BelongsToSetAssociationMixin<InventoryElement, number>
}

export type StorageStateStatic = ModelStatic<StorageState>

export default function(sequelize: Sequelize) {
  const StorageStates = <StorageStateStatic> sequelize.define('StorageStates', {
    storageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Storages',
        key: 'id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    },
    inventoryElementId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'InventoryElements',
        key: 'id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    },
    quantity: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
    },
  })

  StorageStates.associate = function(models) {
    StorageStates.belongsTo(models.Storages)
    StorageStates.belongsTo(models.InventoryElements)
  }

  return StorageStates
}
