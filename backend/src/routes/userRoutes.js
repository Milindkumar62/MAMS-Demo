const express = require('express');
const router = express.Router();
const { createUser, listUsers, deactivateUser } = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const auditLogger = require('../middleware/auditLogger');

// Account provisioning is admin-only, on purpose - see README section on RBAC.
router.post('/', authenticate, authorize('admin'), auditLogger('CREATE_USER'), createUser);
router.get('/', authenticate, authorize('admin'), listUsers);
router.patch('/:id/deactivate', authenticate, authorize('admin'), auditLogger('DEACTIVATE_USER'), deactivateUser);

module.exports = router;
