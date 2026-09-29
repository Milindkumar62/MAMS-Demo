const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Base extends Model {}

Base.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    location: { type: DataTypes.STRING, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { sequelize, modelName: 'Base', tableName: 'bases' }
);

module.exports = Base;
