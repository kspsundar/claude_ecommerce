const { sequelize, Order, OrderItem, CartItem, Product, Address, User, SellerProfile } = require('../models');
const productService = require('./productService');
const cartService = require('./cartService');

// Places one Order for the buyer, split into per-seller OrderItem sub-orders.
async function checkout(userId, addressId) {
  const { items } = await cartService.getCart(userId);
  if (!items.length) {
    const err = new Error('Your cart is empty.');
    err.status = 400;
    throw err;
  }

  const address = addressId ? await Address.findOne({ where: { id: addressId, userId } }) : null;

  return sequelize.transaction(async (t) => {
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.Product.price * item.quantity;
    }

    const order = await Order.create(
      {
        buyerId: userId,
        addressId: address ? address.id : null,
        totalAmount,
        status: 'placed',
        paymentStatus: 'pending',
        shippingSnapshot: address ? JSON.stringify(address) : null
      },
      { transaction: t }
    );

    for (const item of items) {
      await productService.decrementStock(item.productId, item.quantity, t);
      await OrderItem.create(
        {
          orderId: order.id,
          productId: item.productId,
          sellerId: item.Product.sellerId,
          titleSnapshot: item.Product.title,
          quantity: item.quantity,
          price: item.Product.price,
          status: 'placed'
        },
        { transaction: t }
      );
    }

    await cartService.clearCart(userId, t);

    return order;
  });
}

async function listForBuyer(buyerId) {
  return Order.findAll({
    where: { buyerId },
    include: [{ model: OrderItem, as: 'items' }],
    order: [['createdAt', 'DESC']]
  });
}

async function getOrderForBuyer(orderId, buyerId) {
  return Order.findOne({
    where: { id: orderId, buyerId },
    include: [{ model: OrderItem, as: 'items', include: [{ model: SellerProfile, as: 'seller', attributes: ['id', 'storeName'] }] }, Address]
  });
}

async function getOrderForAdmin(orderId) {
  return Order.findByPk(orderId, {
    include: [
      { model: OrderItem, as: 'items', include: [{ model: SellerProfile, as: 'seller', attributes: ['id', 'storeName'] }] },
      { model: User, as: 'buyer', attributes: ['id', 'name', 'email'] },
      Address
    ]
  });
}

async function listAllForAdmin() {
  return Order.findAll({
    include: [{ model: User, as: 'buyer', attributes: ['id', 'name', 'email'] }],
    order: [['createdAt', 'DESC']]
  });
}

async function listItemsForSeller(sellerId) {
  return OrderItem.findAll({
    where: { sellerId },
    include: [{ model: Order, include: [{ model: User, as: 'buyer', attributes: ['id', 'name', 'email'] }] }, { model: Product, attributes: ['id', 'title', 'slug'] }],
    order: [['createdAt', 'DESC']]
  });
}

function recomputeOrderStatus(itemStatuses) {
  if (itemStatuses.every((s) => s === 'cancelled')) return 'cancelled';
  if (itemStatuses.every((s) => s === 'completed' || s === 'cancelled')) return 'completed';
  if (itemStatuses.every((s) => ['delivered', 'completed', 'cancelled'].includes(s))) return 'delivered';
  if (itemStatuses.some((s) => s === 'shipped')) return 'shipped';
  if (itemStatuses.every((s) => s === 'confirmed' || ['delivered', 'completed'].includes(s))) return 'confirmed';
  return 'placed';
}

async function updateItemStatus(itemId, sellerId, status) {
  const item = await OrderItem.findOne({ where: { id: itemId, sellerId } });
  if (!item) {
    const err = new Error('Order item not found.');
    err.status = 404;
    throw err;
  }
  item.status = status;
  await item.save();

  const order = await Order.findByPk(item.orderId, { include: [{ model: OrderItem, as: 'items' }] });
  order.status = recomputeOrderStatus(order.items.map((i) => i.status));
  await order.save();

  return item;
}

async function cancelOrder(orderId, buyerId) {
  const order = await Order.findOne({ where: { id: orderId, buyerId }, include: [{ model: OrderItem, as: 'items' }] });
  if (!order) {
    const err = new Error('Order not found.');
    err.status = 404;
    throw err;
  }
  if (!['placed', 'confirmed'].includes(order.status)) {
    const err = new Error('This order can no longer be cancelled.');
    err.status = 400;
    throw err;
  }

  return sequelize.transaction(async (t) => {
    for (const item of order.items) {
      item.status = 'cancelled';
      await item.save({ transaction: t });
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (product) {
        product.stock += item.quantity;
        await product.save({ transaction: t });
      }
    }
    order.status = 'cancelled';
    await order.save({ transaction: t });
    return order;
  });
}

module.exports = {
  checkout,
  listForBuyer,
  getOrderForBuyer,
  getOrderForAdmin,
  listAllForAdmin,
  listItemsForSeller,
  updateItemStatus,
  cancelOrder
};
