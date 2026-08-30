const { CartItem, Product, ProductImage, SellerProfile } = require('../models');

async function getCart(userId) {
  const items = await CartItem.findAll({
    where: { userId },
    include: [
      {
        model: Product,
        include: [{ model: ProductImage, as: 'images' }, { model: SellerProfile, as: 'seller', attributes: ['id', 'storeName'] }]
      }
    ],
    order: [['createdAt', 'ASC']]
  });

  const total = items.reduce((sum, item) => sum + item.Product.price * item.quantity, 0);
  return { items, total };
}

async function addItem(userId, productId, quantity = 1) {
  const product = await Product.findByPk(productId);
  if (!product || product.status !== 'approved' || !product.isActive) {
    const err = new Error('This product is not available.');
    err.status = 404;
    throw err;
  }

  let item = await CartItem.findOne({ where: { userId, productId } });
  if (item) {
    item.quantity += Number(quantity);
    await item.save();
  } else {
    item = await CartItem.create({ userId, productId, quantity: Number(quantity) });
  }
  return item;
}

async function updateItem(userId, itemId, quantity) {
  const item = await CartItem.findOne({ where: { id: itemId, userId } });
  if (!item) {
    const err = new Error('Cart item not found.');
    err.status = 404;
    throw err;
  }
  if (quantity <= 0) {
    await item.destroy();
    return null;
  }
  item.quantity = quantity;
  await item.save();
  return item;
}

async function removeItem(userId, itemId) {
  const item = await CartItem.findOne({ where: { id: itemId, userId } });
  if (item) await item.destroy();
}

async function clearCart(userId, transaction) {
  await CartItem.destroy({ where: { userId }, transaction });
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
