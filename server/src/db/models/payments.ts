import { Sequelize, DataTypes, Model, Models, Instance } from 'sequelize'

export interface PaymentAttributes {
  id: number
  value: string
  clientId: number
  userId: number
  date: Date
  dateFrom: Date
  dateTo: Date
  invoiceNo: string
  invoiceDate: Date
  directPayment: boolean
}

export type PaymentInstance = Instance<PaymentAttributes> & PaymentAttributes

export type PaymentModel = Model<PaymentInstance, PaymentAttributes>

export default function (sequelize: Sequelize, DataTypes: DataTypes) {
  const Payments = sequelize.define<PaymentInstance, PaymentAttributes>('Payments', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    value: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    dateFrom: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    dateTo: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    invoiceNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    invoiceDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    directPayment: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {})
  Payments.associate = function(models: Models) {
    // associations can be defined here
    Payments.belongsTo(models.Clients)
    Payments.belongsTo(models.Users)
  }
  return Payments;
}
