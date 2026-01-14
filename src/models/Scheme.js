const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Scheme = sequelize.define('Scheme', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  ministry: {
    type: DataTypes.STRING, // e.g., "Ministry of New and Renewable Energy"
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  eligibility_criteria: {
    type: DataTypes.TEXT
  },
  application_link: {
    type: DataTypes.STRING // External link or instructions
  },
  funding_type: {
    type: DataTypes.ENUM('GRANT', 'LOAN', 'SUBSIDY', 'INSURANCE'),
    defaultValue: 'GRANT'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Scheme;
