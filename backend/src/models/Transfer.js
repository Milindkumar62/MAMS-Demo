const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Transfer extends Model {}

Transfer.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    equipmentTypeId: { type: DataTypes.UUID, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    fromBaseId: { type: DataTypes.UUID, allowNull: false },
    toBaseId: { type: DataTypes.UUID, allowNull: false },
    transferDate: { type: DataTypes.DATEONLY, allowNull: false },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
      defaultValue: 'completed',
    },
    notes: { type: DataTypes.STRING, allowNull: true },
    createdBy: { type: DataTypes.UUID, allowNull: false },
  },
  { sequelize, modelName: 'Transfer', tableName: 'transfers' }
);

module.exports = Transfer;
