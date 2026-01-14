const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Order = require('./Order');
const User = require('./User');

const OrderStatusHistory = sequelize.define('OrderStatusHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  order_id: {
    type: DataTypes.UUID,
    references: {
      model: Order,
      key: 'id'
    }
  },
  old_status: {
    type: DataTypes.STRING
  },
  new_status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  changed_by: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = OrderStatusHistory;
