'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const data = [];
    for (let i = 1; i <= 20; i++) {
      data.push({
        nama: `Mahasiswa ${i}`,
        nim: `NIM${String(i).padStart(4, '0')}`,
        email: `mhs${i}@example.com`,
        foto: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    await queryInterface.bulkInsert('mahasiswas', data);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('mahasiswas', null, {});
  }
};
