const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const PaymentMethod = sequelize.define('PaymentMethod', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  method_type: {
    type: DataTypes.ENUM('UPI', 'CARD', 'NETBANKING'),
    allowNull: false
  },
  method_details: {
    type: DataTypes.JSON,
    allowNull: false
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = PaymentMethod;
