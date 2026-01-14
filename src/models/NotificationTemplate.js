const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NotificationTemplate = sequelize.define('NotificationTemplate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  title_template: {
    type: DataTypes.STRING,
    allowNull: false
  },
  body_template: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('EMAIL', 'SMS', 'PUSH', 'IN_APP'),
    defaultValue: 'IN_APP'
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = NotificationTemplate;
