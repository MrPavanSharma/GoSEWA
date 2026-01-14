const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  gaushala_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Category,
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  sku: {
    type: DataTypes.STRING,
    unique: true
  },
  unit_type: {
    type: DataTypes.ENUM('KG', 'LITER', 'PIECE', 'BAG'),
    allowNull: false
  },
  price_per_unit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  available_quantity: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  min_order_quantity: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 1
  },
  quality_grade: {
    type: DataTypes.ENUM('A', 'B', 'C', 'PREMIUM'),
    defaultValue: 'A'
  },
  is_organic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  expiry_date: {
    type: DataTypes.DATEONLY
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Product;
