const orderService = require('../../services/orderService');

exports.checkout = async (req, res) => {
  try {
    const order = await orderService.checkout(req.user.id, req.body.addressId);
    res.status(201).json({ order });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  const orders = await orderService.listForBuyer(req.user.id);
  res.json({ orders });
};

exports.show = async (req, res) => {
  const order = await orderService.getOrderForBuyer(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  res.json({ order });
};

exports.cancel = async (req, res) => {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.user.id);
    res.json({ order });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
