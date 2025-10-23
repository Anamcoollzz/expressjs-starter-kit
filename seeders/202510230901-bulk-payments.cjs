'use strict';

const { faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // gather user ids to link
    const users = await queryInterface.sequelize.query("SELECT id FROM users", { type: queryInterface.sequelize.QueryTypes.SELECT });
    const userIds = users.map(u => u.id);
    const statuses = ['pending','settlement','expire','cancel','deny'];
    const types = ['bank_transfer','echannel','gopay','qris'];
    const now = new Date();

    const payments = [];
    for (let i = 0; i < 300; i++) {
      const amount = faker.number.int({ min: 10000, max: 500000 });
      const status = faker.helpers.arrayElement(statuses);
      const ptype = faker.helpers.arrayElement(types);
      const createdAt = faker.date.between({ from: new Date(now.getFullYear(), 0, 1), to: now });
      const updatedAt = faker.date.between({ from: createdAt, to: now });
      const orderId = `ORD-${Date.now()}-${i}-${faker.string.alphanumeric(6)}`;
      const vaNumbers = ptype === 'bank_transfer' ? JSON.stringify([{ bank: 'bca', va_number: faker.string.numeric(10) }]) : null;

      payments.push({
        orderId,
        userId: userIds.length ? faker.helpers.arrayElement(userIds) : null,
        amount,
        status,
        paymentType: ptype,
        transactionId: `trx_${faker.string.alphanumeric(12)}`,
        fraudStatus: status === 'settlement' ? 'accept' : null,
        snapToken: null,
        redirectUrl: null,
        rawRequest: null,
        rawResponse: null,
        vaNumbers,
        signatureKey: null,
        settlementTime: status === 'settlement' ? updatedAt : null,
        refundTime: null,
        createdAt,
        updatedAt
      });
    }

    await queryInterface.bulkInsert('payments', payments);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('payments', null, {});
  }
};
