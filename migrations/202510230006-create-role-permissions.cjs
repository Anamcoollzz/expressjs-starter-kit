'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('role_permissions', {
      roleId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      permissionId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('role_permissions');
  }
};
