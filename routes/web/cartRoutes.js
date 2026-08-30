const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/web/cartController');
const orderController = require('../../controllers/web/orderController');
const { requireAuth } = require('../../middleware/webAuth');

router.get('/cart', requireAuth, cartController.show);
router.post('/cart/add', requireAuth, cartController.add);
router.post('/cart/update/:id', requireAuth, cartController.update);
router.post('/cart/remove/:id', requireAuth, cartController.remove);

router.get('/cart/checkout', requireAuth, cartController.showCheckout);
router.post('/cart/checkout', requireAuth, orderController.placeOrder);

module.exports = router;
