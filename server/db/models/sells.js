'use strict';
module.exports = function(sequelize, DataTypes) {
  var Sells = sequelize.define('Sells', {
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    cash: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    priceOverride: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: true,
      defaultValue: null,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    value: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
    },
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Sells.belongsTo(models.Users)
        Sells.belongsTo(models.Clients)
        Sells.belongsTo(models.Products)
      }
    }
  });
  return Sells;
};
