'use strict';
module.exports = function(sequelize, DataTypes) {
  var Prices = sequelize.define('Prices', {
    value: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
    },
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Prices.belongsTo(models.Clients)
        Prices.belongsTo(models.Products)
      }
    }
  });
  return Prices;
};