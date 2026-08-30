const sellerService = require('../../services/sellerService');
const productService = require('../../services/productService');
const categoryService = require('../../services/categoryService');
const orderService = require('../../services/orderService');
const { Order } = require('../../models');

exports.showOnboarding = async (req, res) => {
  const profile = await sellerService.getProfileByUserId(req.session.user.id);
  res.render('seller/onboarding', { title: 'Become a seller', profile });
};

exports.submitOnboarding = async (req, res) => {
  try {
    const documentPath = req.file ? `/uploads/${req.file.filename}` : null;
    await sellerService.applyAsSeller(req.session.user.id, { ...req.body, documentPath });
    req.flash('success', 'Application submitted! An admin will review it shortly.');
    res.redirect('/seller/onboarding');
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/seller/onboarding');
  }
};

exports.dashboard = async (req, res) => {
  const profile = await sellerService.requireApprovedSellerProfile(req.session.user.id);
  const stats = await sellerService.getDashboardStats(profile.id);
  res.render('seller/dashboard', { title: 'Seller dashboard', profile, stats });
};

exports.listProducts = async (req, res) => {
  const profile = await sellerService.requireApprovedSellerProfile(req.session.user.id);
  const products = await productService.listForSeller(profile.id);
  res.render('seller/products', { title: 'My products', products, profile });
};

exports.showNewProduct = async (req, res) => {
  await sellerService.requireApprovedSellerProfile(req.session.user.id);
  const categories = await categoryService.listAll();
  res.render('seller/productForm', { title: 'New product', categories, product: null });
};

exports.createProduct = async (req, res) => {
  const profile = await sellerService.requireApprovedSellerProfile(req.session.user.id);
  const imagePaths = (req.files || []).map((f) => `/uploads/${f.filename}`);
  await productService.createProduct(
    profile.id,
    {
      title: req.body.title,
      description: req.body.description,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      categoryId: req.body.categoryId || null
    },
    imagePaths
  );
  req.flash('success', 'Product submitted for admin approval.');
  res.redirect('/seller/products');
};

exports.showEditProduct = async (req, res) => {
  const profile = await sellerService.requireApprovedSellerProfile(req.session.user.id);
  const product = await productService.getById(req.params.id);
  if (!product || product.sellerId !== profile.id) {
    req.flash('error', 'Product not found.');
    return res.redirect('/seller/products');
  }
  const categories = await categoryService.listAll();
  res.render('seller/productForm', { title: 'Edit product', categories, product });
};

exports.updateProduct = async (req, res) => {
  const profile = await sellerService.requireApprovedSellerProfile(req.session.user.id);
  const product = await productService.getById(req.params.id);
  if (!product || product.sellerId !== profile.id) {
    req.flash('error', 'Product not found.');
    return res.redirect('/seller/products');
  }
  const imagePaths = (req.files || []).map((f) => `/uploads/${f.filename}`);
  await productService.updateProduct(
    product,
    {
      title: req.body.title,
      description: req.body.description,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      categoryId: req.body.categoryId || null
    },
    imagePaths
  );
  req.flash('success', 'Product updated and resubmitted for approval.');
  res.redirect('/seller/products');
};

exports.deleteProduct = async (req, res) => {
  const profile = await sellerService.requireApprovedSellerProfile(req.session.user.id);
  const product = await productService.getById(req.params.id);
  if (product && product.sellerId === profile.id) {
    await productService.deleteProduct(product);
    req.flash('success', 'Product deleted.');
  }
  res.redirect('/seller/products');
};

exports.listOrders = async (req, res) => {
  const profile = await sellerService.requireApprovedSellerProfile(req.session.user.id);
  const items = await orderService.listItemsForSeller(profile.id);
  res.render('seller/orders', { title: 'Orders', items, statuses: Order.STATUSES });
};

exports.updateOrderItemStatus = async (req, res) => {
  const profile = await sellerService.requireApprovedSellerProfile(req.session.user.id);
  try {
    await orderService.updateItemStatus(req.params.itemId, profile.id, req.body.status);
    req.flash('success', 'Order status updated.');
  } catch (err) {
    req.flash('error', err.message);
  }
  res.redirect('/seller/orders');
};
