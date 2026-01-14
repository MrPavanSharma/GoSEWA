const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const BusinessDocument = sequelize.define('BusinessDocument', {
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
  document_type: {
    type: DataTypes.ENUM('GST_CERTIFICATE', 'PAN_CARD', 'FSSAI_LICENSE', 'INCORPORATION_CERT'),
    allowNull: false
  },
  document_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  verified_by: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id'
    }
  },
  verification_status: {
    type: DataTypes.ENUM('PENDING', 'VERIFIED', 'REJECTED'),
    defaultValue: 'PENDING'
  },
  verified_at: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true,
  createdAt: 'uploaded_at',
  updatedAt: false
});

module.exports = BusinessDocument;
