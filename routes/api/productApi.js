const express = require('express');
const router = express.Router();
const productController = require('../../controllers/api/productController');
const { authenticate, authorize } = require('../../middleware/apiAuth');

router.get('/', productController.list);
router.get('/:slug', productController.show);
router.post('/', authenticate, authorize('seller'), productController.create);
router.put('/:id', authenticate, authorize('seller'), productController.update);
router.delete('/:id', authenticate, authorize('seller'), productController.remove);

module.exports = router;
