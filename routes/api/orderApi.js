const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/api/orderController');
const { authenticate } = require('../../middleware/apiAuth');

router.use(authenticate);
router.post('/', orderController.checkout);
router.get('/', orderController.list);
router.get('/:id', orderController.show);
router.post('/:id/cancel', orderController.cancel);

module.exports = router;
