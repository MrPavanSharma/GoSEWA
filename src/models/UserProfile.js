const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const UserProfile = sequelize.define('UserProfile', {
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
  full_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  business_name: {
    type: DataTypes.STRING
  },
  business_type: {
    type: DataTypes.STRING
  },
  gst_number: {
    type: DataTypes.STRING
  },
  pan_number: {
    type: DataTypes.STRING
  },
  profile_image_url: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  },
  verification_status: {
    type: DataTypes.ENUM('PENDING', 'VERIFIED', 'REJECTED'),
    defaultValue: 'PENDING'
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = UserProfile;
