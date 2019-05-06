import { Sequelize, DataTypes, Model } from 'sequelize'
import { ModelStatic } from './type-utils'

export interface Payment extends Model {
  readonly id: number

  readonly value: string

  readonly clientId: number

  readonly userId: number

  readonly date: Date

  readonly dateFrom: Date

  readonly dateTo: Date

  readonly invoiceNo: string

  readonly invoiceDate: Date

  readonly directPayment: boolean
}

export type PaymentStatic = ModelStatic<Payment>

export default function (sequelize: Sequelize) {
  const Payments = <PaymentStatic> sequelize.define('Payments', {
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
      allowNull: true,
    },
    dateTo: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    invoiceNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    invoiceDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    directPayment: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    paranoid: true,
    validate: {
      bothDatesOrNone() {
        if ((this.dateFrom === null) !== (this.dateTo === null)) {
          throw new Error('Specify both dates or neither')
        }
      },
    },
  })
  Payments.associate = function(models) {
    // associations can be defined here
    Payments.belongsTo(models.Clients)
    Payments.belongsTo(models.Users)
  }
  return Payments;
}
