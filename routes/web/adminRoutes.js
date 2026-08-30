const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/web/adminController');
const { requireAuth, requireRole } = require('../../middleware/webAuth');

router.use('/admin', requireAuth, requireRole('admin'));

router.get('/admin', adminController.dashboard);
router.get('/admin/users', adminController.listUsers);
router.post('/admin/users/:id/ban', adminController.banUser);
router.post('/admin/users/:id/unban', adminController.unbanUser);

router.get('/admin/sellers', adminController.listSellers);
router.post('/admin/sellers/:id/status', adminController.setSellerStatus);

router.get('/admin/products', adminController.listProducts);
router.post('/admin/products/:id/status', adminController.setProductStatus);

router.get('/admin/categories', adminController.listCategories);
router.post('/admin/categories', adminController.createCategory);
router.post('/admin/categories/:id/delete', adminController.deleteCategory);

router.get('/admin/orders', adminController.listOrders);
router.get('/admin/orders/:id', adminController.showOrder);

module.exports = router;
