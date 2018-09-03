'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('Sells', 'deleted', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Sells', 'deleted');
  }
};
