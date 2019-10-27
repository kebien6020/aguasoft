import { Sequelize, DataTypes, Model } from 'sequelize'
import { ModelStatic } from '../type-utils'

export interface Storage extends Model {
  readonly id: number
  readonly code: string
  readonly name: string

  readonly createdAt: Date
  readonly updatedAt: Date
  readonly deletedAt: Date | null
}

export type StorageStatic = ModelStatic<Storage>

export default function (sequelize: Sequelize) {
  const Storages = <StorageStatic> sequelize.define('Storages', {
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
  }, {
    paranoid: true,
  })

  return Storages;
}
