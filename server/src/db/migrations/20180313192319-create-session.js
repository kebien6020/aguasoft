'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Sessions', {
      sid: {
        primaryKey: true,
        type: Sequelize.STRING
      },
      userId: {
        type: Sequelize.STRING
      },
      expires: {
        type: Sequelize.DATE
      },
      data: {
        type: Sequelize.STRING(50000)
      },
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Sessions');
  }
};
