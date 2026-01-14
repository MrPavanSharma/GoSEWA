const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Scheme = require('./Scheme');

const SchemeApplication = sequelize.define('SchemeApplication', {
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
  scheme_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Scheme,
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('APPLIED', 'IN_REVIEW', 'APPROVED', 'REJECTED'),
    defaultValue: 'APPLIED'
  },
  application_notes: {
    type: DataTypes.TEXT // User notes or Admin feedback
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = SchemeApplication;
