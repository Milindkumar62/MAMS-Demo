const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Base } = require('../models');

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ where: { email }, include: [{ model: Base, as: 'base' }] });
  if (!user || !user.isActive) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      baseId: user.baseId,
      baseName: user.base ? user.base.name : null,
    },
  });
}

async function me(req, res) {
  const user = await User.findByPk(req.user.id, { include: [{ model: Base, as: 'base' }] });
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    baseId: user.baseId,
    baseName: user.base ? user.base.name : null,
  });
}

// ---- DEMO-ONLY self-registration ----
// This exists purely so people trying the project can create their own
// login without you handing out admin credentials. It is deliberately
// crippled compared to a real account-creation flow:
//   1. It only exists at all if DEMO_REGISTRATION_ENABLED=true in .env -
//      flip that to false (or delete this route) before any real deployment.
//   2. The role is hardcoded to 'logistics_officer' - the least-privileged
//      role that isn't scoped to one base - no matter what the client sends.
//      Nobody can self-register as admin or base_commander.
// The real, production-appropriate way to create every other kind of
// account is the admin-only POST /api/users endpoint (userController.js).


async function register(req, res) {
  if (process.env.DEMO_REGISTRATION_ENABLED !== 'true') {
    return res.status(403).json({
      message: 'Self-registration is disabled. Ask an admin to create your account.',
    });
  }

  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email, password are required' });
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
    role: 'logistics_officer', // hardcoded - see comment above
    baseId: null,
  });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      baseId: null,
      baseName: null,
    },
  });
}

module.exports = { login, me, register };
