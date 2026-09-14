const express = require('express');
const router = express.Router();
const pushController = require('../../controllers/web/pushController');
const { requireAuth } = require('../../middleware/webAuth');

router.get('/push/vapid-public-key', pushController.vapidPublicKey);
router.post('/push/subscribe', requireAuth, pushController.subscribe);
router.post('/push/unsubscribe', requireAuth, pushController.unsubscribe);

module.exports = router;
