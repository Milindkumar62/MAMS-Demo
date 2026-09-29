const express = require('express');
const router = express.Router();
const { login, me, register } = require('../controllers/authController');
const authenticate = require('../middleware/auth');

router.post('/login', login);
router.post('/register', register); // demo-only, see authController.js
router.get('/me', authenticate, me);

module.exports = router;
