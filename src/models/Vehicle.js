const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  transporter_id: { // Owned by the User (Transporter)
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  vehicle_number: {
    type: DataTypes.STRING, // Registration Plate
    allowNull: false,
    unique: true
  },
  vehicle_type: {
    type: DataTypes.ENUM('TRUCK', 'VAN', 'PICKUP', 'BIKE', 'REFRIGERATED_TRUCK'),
    defaultValue: 'TRUCK'
  },
  capacity_kg: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  is_refrigerated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('AVAILABLE', 'IN_TRANSIT', 'MAINTENANCE'),
    defaultValue: 'AVAILABLE'
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Vehicle;
