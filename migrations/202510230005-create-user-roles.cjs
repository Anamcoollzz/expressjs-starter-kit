'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_roles', {
      userId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      roleId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_roles');
  }
};
