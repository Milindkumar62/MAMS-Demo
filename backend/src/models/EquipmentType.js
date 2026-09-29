const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class EquipmentType extends Model {}

EquipmentType.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true }, // e.g. "5.56mm Rifle"
    category: {
      type: DataTypes.ENUM('vehicle', 'weapon', 'ammunition'),
      allowNull: false,
    },
    unit: { type: DataTypes.STRING, defaultValue: 'unit' }, // e.g. "rounds", "unit"
  },
  { sequelize, modelName: 'EquipmentType', tableName: 'equipment_types' }
);

module.exports = EquipmentType;
