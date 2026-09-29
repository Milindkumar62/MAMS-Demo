const express = require('express');
const router = express.Router();
const { listBases, listEquipmentTypes } = require('../controllers/referenceController');
const authenticate = require('../middleware/auth');

// Every authenticated role needs these for dropdowns/filters.
router.get('/bases', authenticate, listBases);
router.get('/equipment-types', authenticate, listEquipmentTypes);

module.exports = router;
