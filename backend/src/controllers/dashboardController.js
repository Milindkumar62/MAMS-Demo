const { Op } = require('sequelize');
const {
  Purchase, Transfer, Assignment, Expenditure, Base, EquipmentType,
} = require('../models');

// Builds a common WHERE clause fragment from the dashboard filters.
function buildFilters(query, baseField = 'baseId') {
  const where = {};
  if (query.equipmentTypeId) where.equipmentTypeId = query.equipmentTypeId;
  if (query.baseId && baseField) where[baseField] = query.baseId;
  return where;
}

async function sumQuantity(Model, where) {
  const result = await Model.sum('quantity', { where });
  return result || 0;
}

// GET /api/dashboard
// Query params: startDate, endDate, baseId, equipmentTypeId
async function getDashboard(req, res) {
  const { startDate, endDate, baseId, equipmentTypeId } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'startDate and endDate are required (YYYY-MM-DD)' });
  }

  const rangeFilter = { [Op.between]: [startDate, endDate] };
  const beforeFilter = { [Op.lt]: startDate };

  const baseWhere = {};
  if (baseId) baseWhere.baseId = baseId;
  const equipWhere = {};
  if (equipmentTypeId) equipWhere.equipmentTypeId = equipmentTypeId;

  // ---- Opening balance: everything that happened strictly BEFORE startDate ----
  const openingPurchases = await sumQuantity(Purchase, {
    ...baseWhere, ...equipWhere, purchaseDate: beforeFilter,
  });
  const openingTransfersIn = await sumQuantity(Transfer, {
    ...(baseId ? { toBaseId: baseId } : {}), ...equipWhere, transferDate: beforeFilter, status: 'completed',
  });
  const openingTransfersOut = await sumQuantity(Transfer, {
    ...(baseId ? { fromBaseId: baseId } : {}), ...equipWhere, transferDate: beforeFilter, status: 'completed',
  });
  const openingExpended = await sumQuantity(Expenditure, {
    ...baseWhere, ...equipWhere, expendedDate: beforeFilter,
  });
  const openingBalance = openingPurchases + openingTransfersIn - openingTransfersOut - openingExpended;

  // ---- Movement WITHIN the selected date range ----
  const purchases = await sumQuantity(Purchase, {
    ...baseWhere, ...equipWhere, purchaseDate: rangeFilter,
  });
  const transfersIn = await sumQuantity(Transfer, {
    ...(baseId ? { toBaseId: baseId } : {}), ...equipWhere, transferDate: rangeFilter, status: 'completed',
  });
  const transfersOut = await sumQuantity(Transfer, {
    ...(baseId ? { fromBaseId: baseId } : {}), ...equipWhere, transferDate: rangeFilter, status: 'completed',
  });
  const expended = await sumQuantity(Expenditure, {
    ...baseWhere, ...equipWhere, expendedDate: rangeFilter,
  });
  const assigned = await sumQuantity(Assignment, {
    ...baseWhere, ...equipWhere, assignedDate: rangeFilter,
  });

  const netMovement = purchases + transfersIn - transfersOut;
  const closingBalance = openingBalance + netMovement - expended;

  res.json({
    filters: { startDate, endDate, baseId: baseId || null, equipmentTypeId: equipmentTypeId || null },
    openingBalance,
    closingBalance,
    netMovement,
    purchases,
    transfersIn,
    transfersOut,
    assigned,
    expended,
  });
}

// GET /api/dashboard/net-movement-detail
// Backs the "click Net Movement" popup: itemised purchases / transfers in / transfers out.
async function getNetMovementDetail(req, res) {
  const { startDate, endDate, baseId, equipmentTypeId } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'startDate and endDate are required' });
  }

  const rangeFilter = { [Op.between]: [startDate, endDate] };
  const baseWhere = {};
  if (baseId) baseWhere.baseId = baseId;
  const equipWhere = {};
  if (equipmentTypeId) equipWhere.equipmentTypeId = equipmentTypeId;

  const include = [
    { model: EquipmentType, as: 'equipmentType', attributes: ['id', 'name', 'category', 'unit'] },
  ];

  const purchases = await Purchase.findAll({
    where: { ...baseWhere, ...equipWhere, purchaseDate: rangeFilter },
    include: [...include, { model: Base, as: 'base', attributes: ['id', 'name'] }],
    order: [['purchaseDate', 'DESC']],
  });

  const transfersIn = await Transfer.findAll({
    where: { ...(baseId ? { toBaseId: baseId } : {}), ...equipWhere, transferDate: rangeFilter, status: 'completed' },
    include: [...include,
      { model: Base, as: 'fromBase', attributes: ['id', 'name'] },
      { model: Base, as: 'toBase', attributes: ['id', 'name'] }],
    order: [['transferDate', 'DESC']],
  });

  const transfersOut = await Transfer.findAll({
    where: { ...(baseId ? { fromBaseId: baseId } : {}), ...equipWhere, transferDate: rangeFilter, status: 'completed' },
    include: [...include,
      { model: Base, as: 'fromBase', attributes: ['id', 'name'] },
      { model: Base, as: 'toBase', attributes: ['id', 'name'] }],
    order: [['transferDate', 'DESC']],
  });

  res.json({ purchases, transfersIn, transfersOut });
}

module.exports = { getDashboard, getNetMovementDetail };
