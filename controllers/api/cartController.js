const cartService = require('../../services/cartService');

exports.get = async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  res.json(cart);
};

exports.add = async (req, res) => {
  try {
    const item = await cartService.addItem(req.user.id, req.body.productId, req.body.quantity || 1);
    res.status(201).json({ item });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await cartService.updateItem(req.user.id, req.params.id, Number(req.body.quantity));
    res.json({ item });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  await cartService.removeItem(req.user.id, req.params.id);
  res.status(204).send();
};
