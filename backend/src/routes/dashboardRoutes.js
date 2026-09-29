const express = require('express');
const router = express.Router();
const { getDashboard, getNetMovementDetail } = require('../controllers/dashboardController');
const authenticate = require('../middleware/auth');
const { scopeToBase } = require('../middleware/rbac');

// All three roles can view the dashboard - base_commander is auto-scoped to their base.
router.get('/', authenticate, scopeToBase, getDashboard);
router.get('/net-movement-detail', authenticate, scopeToBase, getNetMovementDetail);

module.exports = router;
