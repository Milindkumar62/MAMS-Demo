const bcrypt = require('bcryptjs');
const { User, Base } = require('../models');

const publicShape = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  baseId: u.baseId,
  baseName: u.base ? u.base.name : null,
  isActive: u.isActive,
  createdAt: u.createdAt,
});

// POST /api/users  (admin only)
// This is the real "create login" screen - the seed script was only ever a
// bootstrap for the first admin account. From here on, admins create every
// other account through this endpoint.
async function createUser(req, res) {
  const { name, email, password, role, baseId } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'name, email, password, role are required' });
  }
  if (!['admin', 'base_commander', 'logistics_officer'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  if (role === 'base_commander' && !baseId) {
    return res.status(400).json({ message: 'baseId is required for a base_commander' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: 'A user with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
    baseId: role === 'base_commander' ? baseId : null,
  });

  const full = await User.findByPk(user.id, { include: [{ model: Base, as: 'base' }] });
  res.status(201).json(publicShape(full));
}

// GET /api/users  (admin only)
async function listUsers(req, res) {
  const users = await User.findAll({
    include: [{ model: Base, as: 'base' }],
    order: [['createdAt', 'DESC']],
  });
  res.json(users.map(publicShape));
}

// PATCH /api/users/:id/deactivate  (admin only)
async function deactivateUser(req, res) {
  const { id } = req.params;
  if (id === req.user.id) {
    return res.status(400).json({ message: 'You cannot deactivate your own account' });
  }
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.isActive = false;
  await user.save();
  res.json({ message: 'User deactivated' });
}

module.exports = { createUser, listUsers, deactivateUser };
