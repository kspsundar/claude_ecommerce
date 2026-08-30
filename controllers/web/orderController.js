const orderService = require('../../services/orderService');

exports.placeOrder = async (req, res) => {
  try {
    const order = await orderService.checkout(req.session.user.id, req.body.addressId);
    req.flash('success', `Order #${order.id} placed successfully!`);
    res.redirect(`/orders/${order.id}`);
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/cart/checkout');
  }
};

exports.list = async (req, res) => {
  const orders = await orderService.listForBuyer(req.session.user.id);
  res.render('orders/index', { title: 'My orders', orders });
};

exports.show = async (req, res) => {
  const order = await orderService.getOrderForBuyer(req.params.id, req.session.user.id);
  if (!order) {
    return res.status(404).render('errors/404', { title: 'Order not found' });
  }
  res.render('orders/show', { title: `Order #${order.id}`, order });
};

exports.cancel = async (req, res) => {
  try {
    await orderService.cancelOrder(req.params.id, req.session.user.id);
    req.flash('success', 'Order cancelled.');
  } catch (err) {
    req.flash('error', err.message);
  }
  res.redirect(`/orders/${req.params.id}`);
};
