const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Certification = sequelize.define('Certification', {
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
  name: {
    type: DataTypes.STRING, // e.g., "Organic India Certified"
    allowNull: false
  },
  issuing_authority: {
    type: DataTypes.STRING,
    allowNull: false
  },
  certificate_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  issue_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  expiry_date: {
    type: DataTypes.DATE
  },
  document_url: {
    type: DataTypes.STRING, // URL to uploaded PDF/Image
    allowNull: false
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false // Requires Admin approval
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Certification;
