const adminService = require('../../services/adminService');
const sellerService = require('../../services/sellerService');
const productService = require('../../services/productService');
const categoryService = require('../../services/categoryService');
const orderService = require('../../services/orderService');

exports.dashboard = async (req, res) => {
  const stats = await adminService.getDashboardStats();
  res.render('admin/dashboard', { title: 'Admin dashboard', stats });
};

exports.listUsers = async (req, res) => {
  const users = await adminService.listUsers();
  res.render('admin/users', { title: 'Manage users', users });
};

exports.banUser = async (req, res) => {
  await adminService.setUserActive(req.params.id, false);
  req.flash('success', 'User banned.');
  res.redirect('/admin/users');
};

exports.unbanUser = async (req, res) => {
  await adminService.setUserActive(req.params.id, true);
  req.flash('success', 'User reinstated.');
  res.redirect('/admin/users');
};

exports.listSellers = async (req, res) => {
  const sellers = await adminService.listSellers();
  res.render('admin/sellers', { title: 'Manage sellers', sellers });
};

exports.setSellerStatus = async (req, res) => {
  try {
    await sellerService.setSellerStatus(req.params.id, req.body.status);
    req.flash('success', 'Seller status updated.');
  } catch (err) {
    req.flash('error', err.message);
  }
  res.redirect('/admin/sellers');
};

exports.listProducts = async (req, res) => {
  const pending = await adminService.listPendingProducts();
  res.render('admin/products', { title: 'Moderate products', pending });
};

exports.setProductStatus = async (req, res) => {
  try {
    await productService.setModerationStatus(req.params.id, req.body.status);
    req.flash('success', 'Product status updated.');
  } catch (err) {
    req.flash('error', err.message);
  }
  res.redirect('/admin/products');
};

exports.listCategories = async (req, res) => {
  const categories = await categoryService.listAll();
  res.render('admin/categories', { title: 'Manage categories', categories });
};

exports.createCategory = async (req, res) => {
  try {
    await categoryService.createCategory({ name: req.body.name, parentId: req.body.parentId || null });
    req.flash('success', 'Category created.');
  } catch (err) {
    req.flash('error', err.message);
  }
  res.redirect('/admin/categories');
};

exports.deleteCategory = async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  req.flash('success', 'Category deleted.');
  res.redirect('/admin/categories');
};

exports.listOrders = async (req, res) => {
  const orders = await orderService.listAllForAdmin();
  res.render('admin/orders', { title: 'All orders', orders });
};

exports.showOrder = async (req, res) => {
  const order = await orderService.getOrderForAdmin(req.params.id);
  if (!order) {
    return res.status(404).render('errors/404', { title: 'Order not found' });
  }
  res.render('admin/orderShow', { title: `Order #${order.id}`, order });
};
