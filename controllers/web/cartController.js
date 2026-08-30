const cartService = require('../../services/cartService');
const { Address } = require('../../models');

exports.show = async (req, res) => {
  const cart = await cartService.getCart(req.session.user.id);
  res.render('cart/index', { title: 'Your cart', cart });
};

exports.add = async (req, res) => {
  try {
    await cartService.addItem(req.session.user.id, req.body.productId, req.body.quantity || 1);
    req.flash('success', 'Added to cart.');
  } catch (err) {
    req.flash('error', err.message);
  }
  res.redirect(req.get('Referer') || '/products');
};

exports.update = async (req, res) => {
  try {
    await cartService.updateItem(req.session.user.id, req.params.id, Number(req.body.quantity));
  } catch (err) {
    req.flash('error', err.message);
  }
  res.redirect('/cart');
};

exports.remove = async (req, res) => {
  await cartService.removeItem(req.session.user.id, req.params.id);
  req.flash('success', 'Item removed.');
  res.redirect('/cart');
};

exports.showCheckout = async (req, res) => {
  const cart = await cartService.getCart(req.session.user.id);
  if (!cart.items.length) {
    req.flash('error', 'Your cart is empty.');
    return res.redirect('/cart');
  }
  const addresses = await Address.findAll({ where: { userId: req.session.user.id }, order: [['isDefault', 'DESC']] });
  res.render('cart/checkout', { title: 'Checkout', cart, addresses });
};
