import { Sequelize, DataTypes, Model, Models, Instance } from 'sequelize'

export interface SessionAttributes {
  sid: string
  userId: string
  expires: Date
  data: string
}

export type SessionInstance = Instance<SessionAttributes> & SessionAttributes

export type SessionModel = Model<SessionInstance, SessionAttributes>

export default function(sequelize: Sequelize, DataTypes: DataTypes) {
  var Session = sequelize.define<SessionInstance, SessionAttributes>('Session', {
    sid: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    userId: DataTypes.STRING,
    expires: DataTypes.DATE,
    data: DataTypes.STRING(50000)
  }, {
    classMethods: {
      associate: function(models: Models) {
        // associations can be defined here
      }
    },
    timestamps: false
  });
  return Session;
};
