const { Op } = require('sequelize');
const { Transfer, Base, EquipmentType, User } = require('../models');

const includes = [
  { model: Base, as: 'fromBase', attributes: ['id', 'name'] },
  { model: Base, as: 'toBase', attributes: ['id', 'name'] },
  { model: EquipmentType, as: 'equipmentType', attributes: ['id', 'name', 'category', 'unit'] },
  { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
];

// POST /api/transfers
async function createTransfer(req, res) {
  const { equipmentTypeId, quantity, fromBaseId, toBaseId, transferDate, notes } = req.body;

  if (!equipmentTypeId || !quantity || !fromBaseId || !toBaseId || !transferDate) {
    return res.status(400).json({ message: 'equipmentTypeId, quantity, fromBaseId, toBaseId, transferDate are required' });
  }
  if (fromBaseId === toBaseId) {
    return res.status(400).json({ message: 'fromBaseId and toBaseId must differ' });
  }
  if (quantity <= 0) {
    return res.status(400).json({ message: 'quantity must be positive' });
  }

  // A base_commander may only initiate transfers OUT of their own base.
  if (req.user.role === 'base_commander' && fromBaseId !== req.user.baseId) {
    return res.status(403).json({ message: 'You may only transfer assets out of your own base' });
  }

  const transfer = await Transfer.create({
    equipmentTypeId, quantity, fromBaseId, toBaseId, transferDate, notes,
    status: 'completed',
    createdBy: req.user.id,
  });

  const full = await Transfer.findByPk(transfer.id, { include: includes });
  res.status(201).json(full);
}

// GET /api/transfers?startDate=&endDate=&baseId=&equipmentTypeId=&page=&limit=
// baseId here matches transfers where the base is EITHER the source or destination.
async function listTransfers(req, res) {
  const { startDate, endDate, baseId, equipmentTypeId, page = 1, limit = 20 } = req.query;
  const where = {};
  if (equipmentTypeId) where.equipmentTypeId = equipmentTypeId;
  if (startDate && endDate) where.transferDate = { [Op.between]: [startDate, endDate] };
  if (baseId) where[Op.or] = [{ fromBaseId: baseId }, { toBaseId: baseId }];

  const offset = (Number(page) - 1) * Number(limit);
  const { rows, count } = await Transfer.findAndCountAll({
    where, include: includes, order: [['transferDate', 'DESC']], limit: Number(limit), offset,
  });

  res.json({ data: rows, total: count, page: Number(page), limit: Number(limit) });
}

module.exports = { createTransfer, listTransfers };
