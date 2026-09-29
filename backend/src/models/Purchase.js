const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Purchase extends Model {}

Purchase.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    baseId: { type: DataTypes.UUID, allowNull: false },
    equipmentTypeId: { type: DataTypes.UUID, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    purchaseDate: { type: DataTypes.DATEONLY, allowNull: false },
    supplier: { type: DataTypes.STRING, allowNull: true },
    unitCost: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    createdBy: { type: DataTypes.UUID, allowNull: false },
  },
  { sequelize, modelName: 'Purchase', tableName: 'purchases' }
);

module.exports = Purchase;
