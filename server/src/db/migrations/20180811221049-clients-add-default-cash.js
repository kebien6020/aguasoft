'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('Clients', 'defaultCash', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Clients', 'defaultCash');
  }
};
