const slugify = require('slugify');
const { SellerProfile, User, Product, OrderItem } = require('../models');

async function applyAsSeller(userId, { storeName, description, bankAccountName, bankAccountNumber, bankIFSC, documentPath }) {
  const existing = await SellerProfile.findOne({ where: { userId } });
  if (existing) {
    const err = new Error('A seller application already exists for this account.');
    err.status = 409;
    throw err;
  }

  const baseSlug = slugify(storeName, { lower: true, strict: true });
  let slug = baseSlug;
  let suffix = 1;
  while (await SellerProfile.findOne({ where: { storeSlug: slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const profile = await SellerProfile.create({
    userId,
    storeName,
    storeSlug: slug,
    description,
    bankAccountName,
    bankAccountNumber,
    bankIFSC,
    documentPath,
    status: 'pending'
  });

  return profile;
}

async function getProfileByUserId(userId) {
  return SellerProfile.findOne({ where: { userId }, include: [{ model: User, attributes: ['id', 'name', 'email'] }] });
}

async function requireApprovedSellerProfile(userId) {
  const profile = await getProfileByUserId(userId);
  if (!profile || profile.status !== 'approved') {
    const err = new Error('Your seller account is not approved yet.');
    err.status = 403;
    throw err;
  }
  return profile;
}

async function getDashboardStats(sellerProfileId) {
  const [productCount, orderItems] = await Promise.all([
    Product.count({ where: { sellerId: sellerProfileId } }),
    OrderItem.findAll({ where: { sellerId: sellerProfileId } })
  ]);

  const revenue = orderItems
    .filter((i) => i.status !== 'cancelled')
    .reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    productCount,
    orderCount: orderItems.length,
    revenue
  };
}

async function setSellerStatus(profileId, status) {
  const profile = await SellerProfile.findByPk(profileId);
  if (!profile) {
    const err = new Error('Seller not found.');
    err.status = 404;
    throw err;
  }
  profile.status = status;
  await profile.save();

  if (status === 'approved') {
    const user = await User.findByPk(profile.userId);
    if (user && user.role === 'buyer') {
      user.role = 'seller';
      await user.save();
    }
  }

  return profile;
}

module.exports = {
  applyAsSeller,
  getProfileByUserId,
  requireApprovedSellerProfile,
  getDashboardStats,
  setSellerStatus
};
