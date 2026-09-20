const express = require('express');
const router = express.Router();
const sellerController = require('../../controllers/web/sellerController');
const { requireAuth } = require('../../middleware/webAuth');
const upload = require('../../middleware/upload');
const { uploadKycOrFlash } = require('../../middleware/uploadKyc');

router.get('/seller/onboarding', requireAuth, sellerController.showOnboarding);
router.post('/seller/onboarding', requireAuth, uploadKycOrFlash, sellerController.submitOnboarding);
router.get('/seller/onboarding/document', requireAuth, sellerController.downloadOwnDocument);

router.get('/seller/dashboard', requireAuth, sellerController.dashboard);

router.get('/seller/products', requireAuth, sellerController.listProducts);
router.get('/seller/products/new', requireAuth, sellerController.showNewProduct);
router.post('/seller/products', requireAuth, upload.array('images', 5), sellerController.createProduct);
router.get('/seller/products/:id/edit', requireAuth, sellerController.showEditProduct);
router.post('/seller/products/:id', requireAuth, upload.array('images', 5), sellerController.updateProduct);
router.post('/seller/products/:id/delete', requireAuth, sellerController.deleteProduct);

router.get('/seller/orders', requireAuth, sellerController.listOrders);
router.post('/seller/orders/:itemId/status', requireAuth, sellerController.updateOrderItemStatus);

module.exports = router;
