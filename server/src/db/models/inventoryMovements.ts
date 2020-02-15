import { Sequelize, DataTypes, Model } from 'sequelize'
import { ModelStatic } from '../type-utils'
import { Storage } from './storages'
import { InventoryElement } from './inventoryElements'
import { User } from './users'

import {
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
} from 'sequelize'

export interface InventoryMovement extends Model {
  readonly id: number
  readonly storageFromId: number | null
  readonly storageToId: number | null
  readonly inventoryElementFromId: number
  readonly inventoryElementToId: number
  readonly quantityFrom: string
  readonly quantityTo: string
  readonly cause:
      'manual'
    | 'in'
    | 'relocation'
    | 'production'
    | 'sell'
    | 'damage'
  readonly createdBy: number
  readonly rollback: boolean

  // timestamps
  readonly createdAt: Date
  readonly updatedAt: Date

  // soft deletion
  readonly deletedAt: Date | null
  readonly deletedBy: number | null

  // Possible inclusions
  readonly storageFrom?: Storage
  readonly storageTo?: Storage
  readonly inventoryElementFrom?: InventoryElement
  readonly inventoryElementTo?: InventoryElement
  readonly creator?: User
  readonly deletor?: User

  // Methods added when performing associations
  getStorageFrom: BelongsToGetAssociationMixin<Storage>
  setStorageFrom: BelongsToSetAssociationMixin<Storage, number>
  getStorageTo: BelongsToGetAssociationMixin<Storage>
  setStorageTo: BelongsToSetAssociationMixin<Storage, number>
  getInventoryElementFrom: BelongsToGetAssociationMixin<InventoryElement>
  setInventoryElementFrom: BelongsToSetAssociationMixin<InventoryElement, number>
  getInventoryElementTo: BelongsToGetAssociationMixin<InventoryElement>
  setInventoryElementTo: BelongsToSetAssociationMixin<InventoryElement, number>
  getCreator: BelongsToGetAssociationMixin<User>
  setCreator: BelongsToSetAssociationMixin<User, number>
  getDeletor: BelongsToGetAssociationMixin<User>
  setDeletor: BelongsToSetAssociationMixin<User, number>
}

export type InventoryMovementStatic = ModelStatic<InventoryMovement>

export default function(sequelize: Sequelize) {
  const InventoryMovements = <InventoryMovementStatic> sequelize.define('InventoryMovements', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    storageFromId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Storages',
        key: 'id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    },
    storageToId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Storages',
        key: 'id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    },
    inventoryElementFromId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'InventoryElements',
        key: 'id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    },
    inventoryElementToId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'InventoryElements',
        key: 'id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    },
    quantityFrom: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
    },
    quantityTo: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
    },
    cause: {
      type: DataTypes.ENUM(
        'manual',
        'in',
        'relocation',
        'production',
        'sell',
        'damage',
      ),
      allowNull: false,
    },
    rollback: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    },
    deletedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    },
  }, {
    paranoid: true,
    validate: {
      noOmitDeletedBy() {
        if (this.deletedAt !== null && this.deletedBy === null) {
          throw new Error('Trying to delete a movement without specifying deletedBy')
        }
      },
    },
  })

  InventoryMovements.associate = function(models) {
    InventoryMovements.belongsTo(models.Storages, { as: 'storageFrom' })
    InventoryMovements.belongsTo(models.Storages, { as: 'storageTo' })
    InventoryMovements.belongsTo(models.InventoryElements, { as: 'inventoryElementFrom' })
    InventoryMovements.belongsTo(models.InventoryElements, { as: 'inventoryElementTo' })

    InventoryMovements.belongsTo(models.Users, {
      as: 'creator',
      foreignKey: 'createdBy',
    })
    InventoryMovements.belongsTo(models.Users, {
      as: 'deletor',
      foreignKey: 'deletedBy',
    })
  }

  return InventoryMovements
}
