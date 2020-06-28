import { Sequelize, DataTypes, Model } from 'sequelize'
import { ModelStatic } from '../type-utils'
import { User } from './users'

export interface BalanceVerification extends Model {
  readonly id: number
  readonly date: Date
  readonly createdById: number
  readonly adjustAmount: number
  readonly amount: number

  // Posible inclusions
  readonly createdBy?: User

  // Timestamps
  readonly createdAt: Date
  readonly updatedAt: Date
}

export type BalanceVerificationStatic = ModelStatic<BalanceVerification>

export default function (sequelize: Sequelize): BalanceVerificationStatic {
  const BalanceVerifications = <BalanceVerificationStatic> sequelize.define('BalanceVerifications', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'restrict',
      onUpdate: 'cascade',
    },
    adjustAmount: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
    },
  })

  BalanceVerifications.associate = models => {
    BalanceVerifications.belongsTo(models.Users, {
      as: 'createdBy',
      foreignKey: 'createdById',
    })
  }

  return BalanceVerifications
}
