const { Base, EquipmentType } = require('../models');

async function listBases(req, res) {
  const bases = await Base.findAll({ where: { isActive: true }, order: [['name', 'ASC']] });
  res.json(bases);
}

async function listEquipmentTypes(req, res) {
  const types = await EquipmentType.findAll({ order: [['name', 'ASC']] });
  res.json(types);
}

module.exports = { listBases, listEquipmentTypes };
