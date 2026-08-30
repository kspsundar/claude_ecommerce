const express = require('express');
const router = express.Router();
const homeController = require('../../controllers/web/homeController');

router.get('/', homeController.index);

router.use(require('./authRoutes'));
router.use(require('./productRoutes'));
router.use(require('./cartRoutes'));
router.use(require('./orderRoutes'));
router.use(require('./sellerRoutes'));
router.use(require('./adminRoutes'));

module.exports = router;
