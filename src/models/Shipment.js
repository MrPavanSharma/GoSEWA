const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Order = require('./Order');

const Shipment = sequelize.define('Shipment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Order,
      key: 'id'
    }
  },
  carrier: {
    type: DataTypes.STRING, // e.g., 'Delhivery', 'BlueDart'
    allowNull: false
  },
  tracking_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'),
    defaultValue: 'PENDING'
  },
  estimated_delivery_date: {
    type: DataTypes.DATE
  },
  shipping_cost: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  label_url: {
    type: DataTypes.STRING // Link to printable label
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Shipment;
