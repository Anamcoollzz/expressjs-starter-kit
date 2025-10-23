'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true, allowNull: false },
      orderId: { type: Sequelize.STRING, unique: true, allowNull: false },
      userId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      amount: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: true },
      paymentType: { type: Sequelize.STRING, allowNull: true },
      transactionId: { type: Sequelize.STRING, allowNull: true },
      fraudStatus: { type: Sequelize.STRING, allowNull: true },
      snapToken: { type: Sequelize.STRING, allowNull: true },
      redirectUrl: { type: Sequelize.STRING, allowNull: true },
      rawRequest: { type: Sequelize.JSON, allowNull: true },
      rawResponse: { type: Sequelize.JSON, allowNull: true },
      vaNumbers: { type: Sequelize.JSON, allowNull: true },
      signatureKey: { type: Sequelize.STRING, allowNull: true },
      settlementTime: { type: Sequelize.DATE, allowNull: true },
      refundTime: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payments');
  }
};
