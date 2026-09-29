const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class AuditLog extends Model {}

// Every mutating API call is written here for accountability, per the
// "API Logging" non-functional requirement.
AuditLog.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: true },
    userEmail: { type: DataTypes.STRING, allowNull: true },
    action: { type: DataTypes.STRING, allowNull: false }, // e.g. "CREATE_PURCHASE"
    method: { type: DataTypes.STRING, allowNull: false },
    endpoint: { type: DataTypes.STRING, allowNull: false },
    statusCode: { type: DataTypes.INTEGER, allowNull: true },
    requestBody: { type: DataTypes.JSON, allowNull: true },
    ipAddress: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, modelName: 'AuditLog', tableName: 'audit_logs', updatedAt: false }
);

module.exports = AuditLog;
