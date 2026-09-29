// authorize(...roles) - rejects any role not in the allow-list for this route.
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions for this action' });
    }
    next();
  };
}

// scopeToBase - forces base_commander requests to only see/act on their own
// base, regardless of what baseId they pass in query/body. Admins and
// logistics officers are unrestricted (logistics officers are still capped
// on which actions they can do by `authorize`, not which bases they see).
function scopeToBase(req, res, next) {
  if (req.user.role === 'base_commander') {
    const requestedBaseId = req.query.baseId || req.body.baseId;
    if (requestedBaseId && requestedBaseId !== req.user.baseId) {
      return res.status(403).json({ message: 'You may only access your assigned base' });
    }
    // Force it, so it can't be omitted to see other bases either.
    req.query.baseId = req.user.baseId;
    if (req.body && Object.keys(req.body).length) req.body.baseId = req.user.baseId;
  }
  next();
}

module.exports = { authorize, scopeToBase };
