const { Op } = require('sequelize');
const { Purchase, Base, EquipmentType, User } = require('../models');

const includes = [
  { model: Base, as: 'base', attributes: ['id', 'name'] },
  { model: EquipmentType, as: 'equipmentType', attributes: ['id', 'name', 'category', 'unit'] },
  { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
];

// POST /api/purchases
async function createPurchase(req, res) {
  const { baseId, equipmentTypeId, quantity, purchaseDate, supplier, unitCost } = req.body;

  if (!baseId || !equipmentTypeId || !quantity || !purchaseDate) {
    return res.status(400).json({ message: 'baseId, equipmentTypeId, quantity, purchaseDate are required' });
  }
  if (quantity <= 0) {
    return res.status(400).json({ message: 'quantity must be positive' });
  }

  const purchase = await Purchase.create({
    baseId, equipmentTypeId, quantity, purchaseDate, supplier, unitCost,
    createdBy: req.user.id,
  });

  const full = await Purchase.findByPk(purchase.id, { include: includes });
  res.status(201).json(full);
}

// GET /api/purchases?startDate=&endDate=&baseId=&equipmentTypeId=&page=&limit=
async function listPurchases(req, res) {
  const { startDate, endDate, baseId, equipmentTypeId, page = 1, limit = 20 } = req.query;
  const where = {};
  if (baseId) where.baseId = baseId;
  if (equipmentTypeId) where.equipmentTypeId = equipmentTypeId;
  if (startDate && endDate) where.purchaseDate = { [Op.between]: [startDate, endDate] };

  const offset = (Number(page) - 1) * Number(limit);
  const { rows, count } = await Purchase.findAndCountAll({
    where, include: includes, order: [['purchaseDate', 'DESC']], limit: Number(limit), offset,
  });

  res.json({ data: rows, total: count, page: Number(page), limit: Number(limit) });
}

module.exports = { createPurchase, listPurchases };
