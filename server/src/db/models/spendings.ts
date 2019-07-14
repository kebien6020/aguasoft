import { Sequelize, DataTypes, Model } from 'sequelize'
import { ModelStatic } from '../type-utils'
import { User } from './users'
import {
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
} from 'sequelize'

export interface Spending extends Model {
  readonly id: number
  // The date the spending was performed
  readonly date: Date

  readonly description: string

  readonly value: string
  // Whether this was paid out of cash
  readonly fromCash: boolean
  // Whether this is a transfer to our bank account
  readonly isTransfer: boolean
  // timestamps
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly deletedAt: Date | null

  // Possible inclusions
  readonly user?: User

  // Methods added when performing associations
  getUser: BelongsToGetAssociationMixin<User>
  setUser: BelongsToSetAssociationMixin<User, number>
}

export type SpendingStatic = ModelStatic<Spending>

export default function(sequelize: Sequelize) {
  const Spendings = <SpendingStatic> sequelize.define('Spendings', {
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    fromCash: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isTransfer: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'restrict',
      onUpdate: 'restrict',
    },
  }, {
    paranoid: true,
  })

  Spendings.associate = function(models) {
    Spendings.belongsTo(models.Users)
  }

  return Spendings
}
