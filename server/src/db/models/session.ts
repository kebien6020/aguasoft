import { Sequelize, DataTypes, Model } from 'sequelize'
import { ModelStatic } from './type-utils'

export interface Session extends Model {
  readonly sid: string

  readonly userId: string

  readonly expires: Date

  readonly data: string
}

export type SessionStatic = ModelStatic<Session>

export default function(sequelize: Sequelize) {
  var Session = <SessionStatic> sequelize.define('Session', {
    sid: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    userId: DataTypes.STRING,
    expires: DataTypes.DATE,
    data: DataTypes.STRING(50000)
  }, {
    timestamps: false
  });
  return Session;
};
