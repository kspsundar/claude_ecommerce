const express = require('express');
const router = express.Router();
const authController = require('../../controllers/web/authController');
const { requireAuth, requireGuest } = require('../../middleware/webAuth');

router.get('/register', requireGuest, authController.showRegister);
router.post('/register', requireGuest, authController.register);
router.get('/login', requireGuest, authController.showLogin);
router.post('/login', requireGuest, authController.login);
router.post('/logout', authController.logout);

router.get('/profile', requireAuth, authController.showProfile);
router.post('/profile', requireAuth, authController.updateProfile);
router.post('/profile/addresses', requireAuth, authController.addAddress);
router.post('/profile/addresses/:id/delete', requireAuth, authController.deleteAddress);

module.exports = router;
