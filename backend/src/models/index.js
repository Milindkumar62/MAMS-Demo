const sequelize = require('../config/db');
const User = require('./User');
const Base = require('./Base');
const EquipmentType = require('./EquipmentType');
const Purchase = require('./Purchase');
const Transfer = require('./Transfer');
const Assignment = require('./Assignment');
const Expenditure = require('./Expenditure');
const AuditLog = require('./AuditLog');

// ---- Associations ----
User.belongsTo(Base, { foreignKey: 'baseId', as: 'base' });
Base.hasMany(User, { foreignKey: 'baseId', as: 'users' });

Purchase.belongsTo(Base, { foreignKey: 'baseId', as: 'base' });
Purchase.belongsTo(EquipmentType, { foreignKey: 'equipmentTypeId', as: 'equipmentType' });
Purchase.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Transfer.belongsTo(Base, { foreignKey: 'fromBaseId', as: 'fromBase' });
Transfer.belongsTo(Base, { foreignKey: 'toBaseId', as: 'toBase' });
Transfer.belongsTo(EquipmentType, { foreignKey: 'equipmentTypeId', as: 'equipmentType' });
Transfer.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Assignment.belongsTo(Base, { foreignKey: 'baseId', as: 'base' });
Assignment.belongsTo(EquipmentType, { foreignKey: 'equipmentTypeId', as: 'equipmentType' });
Assignment.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Expenditure.belongsTo(Base, { foreignKey: 'baseId', as: 'base' });
Expenditure.belongsTo(EquipmentType, { foreignKey: 'equipmentTypeId', as: 'equipmentType' });
Expenditure.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Base,
  EquipmentType,
  Purchase,
  Transfer,
  Assignment,
  Expenditure,
  AuditLog,
};
