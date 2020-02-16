import { Sequelize, DataTypes, Model } from 'sequelize'
import { ModelStatic } from '../type-utils'

export interface MachineCounter extends Model {
  readonly id: number
  readonly value: number
  readonly type: 'production' | 'new-reel'

  readonly createdAt: Date
  readonly updatedAt: Date
}

export type MachineCounterStatic = ModelStatic<MachineCounter>

export default function (sequelize: Sequelize) {
  const MachineCounters = <MachineCounterStatic> sequelize.define('MachineCounters', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    value: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        'production',
        'new-reel',
      ),
      allowNull: false,
    },
  })

  return MachineCounters;
}
