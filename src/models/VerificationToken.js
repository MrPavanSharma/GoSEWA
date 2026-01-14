const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const VerificationToken = sequelize.define('VerificationToken', {
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
  token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  token_type: {
    type: DataTypes.ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET'),
    allowNull: false
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  used_at: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = VerificationToken;
