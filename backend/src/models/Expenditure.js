const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Expenditure extends Model {}

// Expended assets (e.g. ammunition fired, equipment destroyed/consumed) leave
// the base's inventory permanently, so they DO reduce the closing balance.
Expenditure.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    baseId: { type: DataTypes.UUID, allowNull: false },
    equipmentTypeId: { type: DataTypes.UUID, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    expendedDate: { type: DataTypes.DATEONLY, allowNull: false },
    reason: { type: DataTypes.STRING, allowNull: true }, // e.g. "training exercise"
    createdBy: { type: DataTypes.UUID, allowNull: false },
  },
  { sequelize, modelName: 'Expenditure', tableName: 'expenditures' }
);

module.exports = Expenditure;
