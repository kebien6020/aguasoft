'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('Prices', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Base',
    }).then(() =>
      queryInterface.addConstraint('Prices', ['name', 'clientId', 'productId'], {
        type: 'unique',
        name: 'name_clientId_productId_unique'
      })
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeConstraint('Prices', 'name_clientId_productId_unique')
      .then(() =>
        queryInterface.removeColumn('Prices', 'name')
      )
  }
};
