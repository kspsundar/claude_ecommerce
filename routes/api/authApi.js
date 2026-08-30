const express = require('express');
const router = express.Router();
const authController = require('../../controllers/api/authController');
const { authenticate } = require('../../middleware/apiAuth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);

module.exports = router;
