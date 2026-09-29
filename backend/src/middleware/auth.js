const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Verifies the JWT on every protected request and attaches the user to req.
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid or inactive user' });
    }

    // Minimal, trusted req.user object used by rbac + controllers.
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      baseId: user.baseId,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authenticate;
