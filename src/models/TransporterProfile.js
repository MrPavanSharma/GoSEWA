const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const TransporterProfile = sequelize.define('TransporterProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  company_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  license_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = TransporterProfile;
