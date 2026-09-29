const express = require('express');
const router = express.Router();
const {
  createAssignment, returnAssignment, listAssignments,
  createExpenditure, listExpenditures,
} = require('../controllers/assignmentController');
const authenticate = require('../middleware/auth');
const { authorize, scopeToBase } = require('../middleware/rbac');
const auditLogger = require('../middleware/auditLogger');

// Assignments/Expenditures are operational base-level actions -> admin + base_commander.
router.post(
  '/assignments',
  authenticate,
  authorize('admin', 'base_commander'),
  scopeToBase,
  auditLogger('CREATE_ASSIGNMENT'),
  createAssignment
);
router.patch(
  '/assignments/:id/return',
  authenticate,
  authorize('admin', 'base_commander'),
  auditLogger('RETURN_ASSIGNMENT'),
  returnAssignment
);
router.get('/assignments', authenticate, scopeToBase, listAssignments);

router.post(
  '/expenditures',
  authenticate,
  authorize('admin', 'base_commander'),
  scopeToBase,
  auditLogger('CREATE_EXPENDITURE'),
  createExpenditure
);
router.get('/expenditures', authenticate, scopeToBase, listExpenditures);

module.exports = router;
