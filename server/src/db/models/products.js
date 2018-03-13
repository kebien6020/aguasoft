'use strict';
module.exports = function(sequelize, DataTypes) {
  var Products = sequelize.define('Products', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    basePrice: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
    },
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Products;
};
