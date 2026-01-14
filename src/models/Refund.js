const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Payment = require('./Payment');

const Refund = sequelize.define('Refund', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  payment_id: {
    type: DataTypes.UUID,
    references: {
      model: Payment,
      key: 'id'
    }
  },
  refund_id: { // Gateway Refund ID
    type: DataTypes.STRING,
    unique: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'PENDING'
  },
  processed_at: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Refund;
