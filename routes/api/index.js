const express = require('express');
const router = express.Router();

router.use('/auth', require('./authApi'));
router.use('/products', require('./productApi'));
router.use('/categories', require('./categoryApi'));
router.use('/cart', require('./cartApi'));
router.use('/orders', require('./orderApi'));

module.exports = router;
