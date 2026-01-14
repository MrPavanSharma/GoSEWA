const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const SearchHistory = sequelize.define('SearchHistory', {
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
  search_query: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  filters: {
    type: DataTypes.JSON, // JSONB in Postgres, JSON in SQLite
  },
  result_count: {
    type: DataTypes.INTEGER
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = SearchHistory;
