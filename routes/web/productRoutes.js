const express = require('express');
const router = express.Router();
const productController = require('../../controllers/web/productController');

router.get('/products', productController.index);
router.get('/products/:slug', productController.show);
router.get('/categories/:slug', productController.byCategory);

module.exports = router;
