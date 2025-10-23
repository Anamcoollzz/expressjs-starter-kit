'use strict';

const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const users = [];
    const password = await bcrypt.hash('password', 10);
    const now = new Date();

    for (let i = 0; i < 200; i++) {
      users.push({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password,
        role: 'user',
        createdAt: now,
        updatedAt: now
      });
    }
    // ensure one extra admin sample (besides existing admin@example.com from earlier seeds)
    users.push({
      name: 'Sample Admin',
      email: 'sample.admin@example.com',
      password,
      role: 'admin',
      createdAt: now,
      updatedAt: now
    });

    await queryInterface.bulkInsert('users', users);

    // Optionally assign admin role in pivot if roles table exists
    try {
      const [[adminRole]] = await queryInterface.sequelize.query("SELECT id FROM roles WHERE name='admin' LIMIT 1");
      if (adminRole) {
        const [rows] = await queryInterface.sequelize.query("SELECT id FROM users WHERE email='sample.admin@example.com' LIMIT 1");
        const adminUser = Array.isArray(rows) ? rows[0] : rows;
        if (adminUser) {
          await queryInterface.bulkInsert('user_roles', [{ userId: adminUser.id, roleId: adminRole.id }]);
        }
      }
    } catch (e) { /* ignore if roles not present */ }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_roles', null, {});
    await queryInterface.bulkDelete('users', {
      email: { [Sequelize.Op.in]: ['sample.admin@example.com'] }
    }, {});
    // For bulk users, it's safer to clear users created today with role 'user' (optional).
  }
};
