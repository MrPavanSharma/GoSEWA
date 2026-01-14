const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');

const ProductView = sequelize.define('ProductView', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.UUID,
    references: {
      model: Product,
      key: 'id'
    }
  },
  view_duration: {
    type: DataTypes.INTEGER // seconds
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = ProductView;
