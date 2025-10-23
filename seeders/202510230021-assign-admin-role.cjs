'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const [[user]] = await queryInterface.sequelize.query("SELECT id FROM users WHERE email='admin@example.com' LIMIT 1");
    const [[role]] = await queryInterface.sequelize.query("SELECT id FROM roles WHERE name='admin' LIMIT 1");
    if (user && role) {
      await queryInterface.bulkInsert('user_roles', [{ userId: user.id, roleId: role.id }]);
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_roles', null, {});
  }
};
