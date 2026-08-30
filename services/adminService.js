const { User, SellerProfile, Product, Order } = require('../models');

async function getDashboardStats() {
  const [userCount, sellerCount, pendingSellerCount, productCount, pendingProductCount, orders] = await Promise.all([
    User.count(),
    SellerProfile.count({ where: { status: 'approved' } }),
    SellerProfile.count({ where: { status: 'pending' } }),
    Product.count(),
    Product.count({ where: { status: 'pending' } }),
    Order.findAll()
  ]);

  const gmv = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return {
    userCount,
    sellerCount,
    pendingSellerCount,
    productCount,
    pendingProductCount,
    orderCount: orders.length,
    gmv
  };
}

async function listUsers() {
  return User.findAll({ order: [['createdAt', 'DESC']] });
}

async function setUserActive(userId, isActive) {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }
  user.isActive = isActive;
  await user.save();
  return user;
}

async function listSellers() {
  return SellerProfile.findAll({ include: [{ model: User, attributes: ['id', 'name', 'email'] }], order: [['createdAt', 'DESC']] });
}

async function listPendingProducts() {
  return Product.findAll({ where: { status: 'pending' }, include: [{ model: SellerProfile, as: 'seller', attributes: ['storeName'] }], order: [['createdAt', 'ASC']] });
}

module.exports = { getDashboardStats, listUsers, setUserActive, listSellers, listPendingProducts };
