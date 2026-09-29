const { AuditLog } = require('../models');

// Wraps res.json to capture the response status after the handler runs,
// then writes one row per mutating request (POST/PUT/PATCH/DELETE).
// GET requests are not logged to keep the audit_logs table meaningful.
function auditLogger(action) {
  return (req, res, next) => {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      AuditLog.create({
        userId: req.user ? req.user.id : null,
        userEmail: req.user ? req.user.email : null,
        action,
        method: req.method,
        endpoint: req.originalUrl,
        statusCode: res.statusCode,
        requestBody: req.body,
        ipAddress: req.ip,
      }).catch((err) => console.error('Audit log write failed:', err.message));

      return originalJson(body);
    };

    next();
  };
}

module.exports = auditLogger;
