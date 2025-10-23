'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const [roles] = await Promise.all([
      queryInterface.bulkInsert('roles', [
        { name: 'admin', createdAt: new Date(), updatedAt: new Date() },
        { name: 'user', createdAt: new Date(), updatedAt: new Date() }
      ], { returning: true }),
    ]);

    const permsList = [
      'mahasiswa.view','mahasiswa.create','mahasiswa.update','mahasiswa.delete',
      'users.manage','roles.manage','payments.create'
    ];
    await queryInterface.bulkInsert('permissions', permsList.map(n => ({
      name: n, createdAt: new Date(), updatedAt: new Date()
    })));

    const [[admin]] = await queryInterface.sequelize.query("SELECT id FROM roles WHERE name='admin' LIMIT 1");
    const permissions = await queryInterface.sequelize.query("SELECT id,name FROM permissions", { type: queryInterface.sequelize.QueryTypes.SELECT });

    // map admin -> all permissions
    const rp = permissions.map(p => ({ roleId: admin.id, permissionId: p.id }));
    await queryInterface.bulkInsert('role_permissions', rp);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('user_roles', null, {});
    await queryInterface.bulkDelete('permissions', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  }
};
