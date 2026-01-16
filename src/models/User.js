const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    unique: true
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: true // Allow null for now to be safe, or false if strictly required
  },
  google_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_type: {
    type: DataTypes.ENUM('GAUSHALA', 'ENTREPRENEUR', 'TRANSPORTER', 'ADMIN'),
    allowNull: false
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // Gaushala Specific Fields
  gaushala_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gaushala_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  registration_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  establishment_year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  ownership_type: {
    type: DataTypes.ENUM('trust', 'individual', 'private', 'government', 'ngo', 'other'),
    allowNull: true
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = User;
