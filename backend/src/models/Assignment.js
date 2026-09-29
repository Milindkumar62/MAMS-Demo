const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Assignment extends Model {}

// Represents an asset assigned to personnel. Assigned assets remain part of
// the base's closing balance (they haven't left the base) but are tracked
// separately as "Assigned" on the dashboard.
Assignment.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    baseId: { type: DataTypes.UUID, allowNull: false },
    equipmentTypeId: { type: DataTypes.UUID, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    assignedToName: { type: DataTypes.STRING, allowNull: false }, // personnel name/service no.
    assignedDate: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.ENUM('assigned', 'returned'), defaultValue: 'assigned' },
    returnedDate: { type: DataTypes.DATEONLY, allowNull: true },
    createdBy: { type: DataTypes.UUID, allowNull: false },
  },
  { sequelize, modelName: 'Assignment', tableName: 'assignments' }
);

module.exports = Assignment;
