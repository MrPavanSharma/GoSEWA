const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./Product');
const User = require('./User');

const InventoryLog = sequelize.define('InventoryLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  product_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  },
  quantity_change: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  new_quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  change_type: {
    type: DataTypes.ENUM('ADDITION', 'SALE', 'ADJUSTMENT', 'SPOILAGE'),
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT
  },
  created_by: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = InventoryLog;
