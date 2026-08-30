const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/web/orderController');
const { requireAuth } = require('../../middleware/webAuth');

router.get('/orders', requireAuth, orderController.list);
router.get('/orders/:id', requireAuth, orderController.show);
router.post('/orders/:id/cancel', requireAuth, orderController.cancel);

module.exports = router;
