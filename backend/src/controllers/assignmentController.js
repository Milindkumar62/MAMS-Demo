const { Op } = require('sequelize');
const { Assignment, Expenditure, Base, EquipmentType, User } = require('../models');

const assignIncludes = [
  { model: Base, as: 'base', attributes: ['id', 'name'] },
  { model: EquipmentType, as: 'equipmentType', attributes: ['id', 'name', 'category', 'unit'] },
  { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
];

// POST /api/assignments
async function createAssignment(req, res) {
  const { baseId, equipmentTypeId, quantity, assignedToName, assignedDate } = req.body;
  if (!baseId || !equipmentTypeId || !quantity || !assignedToName || !assignedDate) {
    return res.status(400).json({ message: 'baseId, equipmentTypeId, quantity, assignedToName, assignedDate are required' });
  }

  const assignment = await Assignment.create({
    baseId, equipmentTypeId, quantity, assignedToName, assignedDate,
    status: 'assigned',
    createdBy: req.user.id,
  });

  const full = await Assignment.findByPk(assignment.id, { include: assignIncludes });
  res.status(201).json(full);
}

// PATCH /api/assignments/:id/return
async function returnAssignment(req, res) {
  const { id } = req.params;
  const { returnedDate } = req.body;
  const assignment = await Assignment.findByPk(id);
  if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

  if (req.user.role === 'base_commander' && assignment.baseId !== req.user.baseId) {
    return res.status(403).json({ message: 'You may only manage assignments for your own base' });
  }

  assignment.status = 'returned';
  assignment.returnedDate = returnedDate || new Date().toISOString().slice(0, 10);
  await assignment.save();

  res.json(assignment);
}

// GET /api/assignments?startDate=&endDate=&baseId=&equipmentTypeId=&status=
async function listAssignments(req, res) {
  const { startDate, endDate, baseId, equipmentTypeId, status, page = 1, limit = 20 } = req.query;
  const where = {};
  if (baseId) where.baseId = baseId;
  if (equipmentTypeId) where.equipmentTypeId = equipmentTypeId;
  if (status) where.status = status;
  if (startDate && endDate) where.assignedDate = { [Op.between]: [startDate, endDate] };

  const offset = (Number(page) - 1) * Number(limit);
  const { rows, count } = await Assignment.findAndCountAll({
    where, include: assignIncludes, order: [['assignedDate', 'DESC']], limit: Number(limit), offset,
  });

  res.json({ data: rows, total: count, page: Number(page), limit: Number(limit) });
}

// ---- Expenditures ----

const expendIncludes = [
  { model: Base, as: 'base', attributes: ['id', 'name'] },
  { model: EquipmentType, as: 'equipmentType', attributes: ['id', 'name', 'category', 'unit'] },
  { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
];

// POST /api/expenditures
async function createExpenditure(req, res) {
  const { baseId, equipmentTypeId, quantity, expendedDate, reason } = req.body;
  if (!baseId || !equipmentTypeId || !quantity || !expendedDate) {
    return res.status(400).json({ message: 'baseId, equipmentTypeId, quantity, expendedDate are required' });
  }

  const expenditure = await Expenditure.create({
    baseId, equipmentTypeId, quantity, expendedDate, reason,
    createdBy: req.user.id,
  });

  const full = await Expenditure.findByPk(expenditure.id, { include: expendIncludes });
  res.status(201).json(full);
}

// GET /api/expenditures?startDate=&endDate=&baseId=&equipmentTypeId=
async function listExpenditures(req, res) {
  const { startDate, endDate, baseId, equipmentTypeId, page = 1, limit = 20 } = req.query;
  const where = {};
  if (baseId) where.baseId = baseId;
  if (equipmentTypeId) where.equipmentTypeId = equipmentTypeId;
  if (startDate && endDate) where.expendedDate = { [Op.between]: [startDate, endDate] };

  const offset = (Number(page) - 1) * Number(limit);
  const { rows, count } = await Expenditure.findAndCountAll({
    where, include: expendIncludes, order: [['expendedDate', 'DESC']], limit: Number(limit), offset,
  });

  res.json({ data: rows, total: count, page: Number(page), limit: Number(limit) });
}

module.exports = {
  createAssignment, returnAssignment, listAssignments,
  createExpenditure, listExpenditures,
};
