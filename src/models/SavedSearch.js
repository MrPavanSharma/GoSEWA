const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const SavedSearch = sequelize.define('SavedSearch', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  search_query: {
    type: DataTypes.TEXT
  },
  filters: {
    type: DataTypes.JSON
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notification_frequency: {
    type: DataTypes.STRING
  },
  last_notified_at: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = SavedSearch;
