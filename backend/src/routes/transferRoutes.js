const express = require('express');
const router = express.Router();
const { createTransfer, listTransfers } = require('../controllers/transferController');
const authenticate = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const auditLogger = require('../middleware/auditLogger');

// Admin, Logistics Officer, and Base Commander (for their own base as source)
// can create transfers.
router.post(
  '/',
  authenticate,
  authorize('admin', 'logistics_officer', 'base_commander'),
  auditLogger('CREATE_TRANSFER'),
  createTransfer
);

router.get('/', authenticate, listTransfers);

module.exports = router;
