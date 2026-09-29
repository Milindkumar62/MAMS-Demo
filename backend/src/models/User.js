const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class User extends Model {}

User.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    // Three roles as required by the spec.
    role: {
      type: DataTypes.ENUM('admin', 'base_commander', 'logistics_officer'),
      allowNull: false,
      defaultValue: 'logistics_officer',
    },
    // Null for admin (all bases) and logistics officers who work across bases.
    // Required for base_commander - scopes every query they make.
    baseId: { type: DataTypes.UUID, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { sequelize, modelName: 'User', tableName: 'users' }
);

module.exports = User;
