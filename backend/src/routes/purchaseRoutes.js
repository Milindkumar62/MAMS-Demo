const express = require('express');
const router = express.Router();
const { createPurchase, listPurchases } = require('../controllers/purchaseController');
const authenticate = require('../middleware/auth');
const { authorize, scopeToBase } = require('../middleware/rbac');
const auditLogger = require('../middleware/auditLogger');

// Admin + Logistics Officer can record purchases. Base Commander can view
// (their base) but per spec logistics is the one recording purchases; we
// still allow base_commander to view their own base's purchase history.
router.post(
  '/',
  authenticate,
  authorize('admin', 'logistics_officer'),
  scopeToBase,
  auditLogger('CREATE_PURCHASE'),
  createPurchase
);

router.get('/', authenticate, scopeToBase, listPurchases);

module.exports = router;
