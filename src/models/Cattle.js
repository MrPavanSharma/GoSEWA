const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Cattle = sequelize.define('Cattle', {
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
  tag_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.STRING, // e.g., COW, BUFFALO, CALF, BULL
    allowNull: false,
    defaultValue: 'COW'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  breed: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('MALE', 'FEMALE'),
    allowNull: false
  },
  health_status: {
    type: DataTypes.ENUM('HEALTHY', 'SICK', 'INJURED', 'PREGNANT', 'QUARANTINED'),
    defaultValue: 'HEALTHY'
  },
  milking_status: {
    type: DataTypes.ENUM('LACTATING', 'DRY', 'N/A'),
    defaultValue: 'N/A'
  },
  rfid_tag: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  lactation_number: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  current_status: {
    type: DataTypes.ENUM('CALF', 'HEIFER', 'MILKING', 'DRY', 'SOLD', 'DEAD', 'BULL', 'MALE_CALF'),
    defaultValue: 'MILKING'
  },
  current_group: {
    type: DataTypes.STRING,
    allowNull: true
  },
  entry_type: {
    type: DataTypes.ENUM('BIRTH', 'PURCHASE'),
    allowNull: true
  },
  entry_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  exit_type: {
    type: DataTypes.ENUM('SALE', 'DEATH'),
    allowNull: true
  },
  exit_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  timestamps: true,
  paranoid: true, // Enable soft deletes
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

module.exports = Cattle;
