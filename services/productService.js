const { Op } = require('sequelize');
const slugify = require('slugify');
const { Product, ProductImage, Category, SellerProfile, User } = require('../models');

const PAGE_SIZE = 12;

async function generateUniqueSlug(title) {
  const baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  let suffix = 1;
  while (await Product.findOne({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }
  return slug;
}

async function generateUniqueSku(title) {
  const base = slugify(title, { upper: true, strict: true }).slice(0, 8) || 'SKU';
  let sku = `${base}-${Date.now().toString().slice(-6)}`;
  while (await Product.findOne({ where: { sku } })) {
    sku = `${base}-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 100)}`;
  }
  return sku;
}

// buyer-facing search/filter/sort, only approved + active products
async function searchProducts({ q, categoryId, minPrice, maxPrice, sort, page = 1 } = {}) {
  const where = { status: 'approved', isActive: true };

  if (q) {
    where.title = { [Op.like]: `%${q}%` };
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price[Op.gte] = Number(minPrice);
    if (maxPrice) where.price[Op.lte] = Number(maxPrice);
  }

  let order = [['createdAt', 'DESC']];
  if (sort === 'price_asc') order = [['price', 'ASC']];
  else if (sort === 'price_desc') order = [['price', 'DESC']];
  else if (sort === 'oldest') order = [['createdAt', 'ASC']];

  const offset = (Number(page) - 1) * PAGE_SIZE;

  const { rows, count } = await Product.findAndCountAll({
    where,
    order,
    limit: PAGE_SIZE,
    offset,
    include: [
      { model: ProductImage, as: 'images' },
      { model: Category },
      { model: SellerProfile, as: 'seller', attributes: ['id', 'storeName', 'storeSlug'] }
    ],
    distinct: true
  });

  return {
    products: rows,
    total: count,
    page: Number(page),
    totalPages: Math.max(1, Math.ceil(count / PAGE_SIZE))
  };
}

async function getBySlugPublic(slug) {
  return Product.findOne({
    where: { slug, status: 'approved', isActive: true },
    include: [
      { model: ProductImage, as: 'images' },
      { model: Category },
      { model: SellerProfile, as: 'seller', attributes: ['id', 'storeName', 'storeSlug'] }
    ]
  });
}

async function getById(id) {
  return Product.findByPk(id, {
    include: [{ model: ProductImage, as: 'images' }, { model: Category }, { model: SellerProfile, as: 'seller' }]
  });
}

async function listForSeller(sellerId) {
  return Product.findAll({
    where: { sellerId },
    include: [{ model: ProductImage, as: 'images' }, { model: Category }],
    order: [['createdAt', 'DESC']]
  });
}

async function createProduct(sellerId, { title, description, price, stock, categoryId }, imagePaths = []) {
  const slug = await generateUniqueSlug(title);
  const sku = await generateUniqueSku(title);

  const product = await Product.create({
    sellerId,
    categoryId: categoryId || null,
    title,
    slug,
    description,
    price,
    sku,
    stock: stock || 0,
    status: 'pending'
  });

  if (imagePaths.length) {
    await ProductImage.bulkCreate(
      imagePaths.map((imagePath, idx) => ({ productId: product.id, imagePath, isPrimary: idx === 0 }))
    );
  }

  return product;
}

async function updateProduct(product, { title, description, price, stock, categoryId }, newImagePaths = []) {
  product.title = title ?? product.title;
  product.description = description ?? product.description;
  product.price = price ?? product.price;
  product.stock = stock ?? product.stock;
  product.categoryId = categoryId ?? product.categoryId;
  // edits go back through moderation
  product.status = 'pending';
  await product.save();

  if (newImagePaths.length) {
    await ProductImage.bulkCreate(newImagePaths.map((imagePath) => ({ productId: product.id, imagePath })));
  }

  return product;
}

async function deleteProduct(product) {
  await product.destroy();
}

async function setModerationStatus(productId, status) {
  const product = await Product.findByPk(productId);
  if (!product) {
    const err = new Error('Product not found.');
    err.status = 404;
    throw err;
  }
  product.status = status;
  await product.save();
  return product;
}

async function decrementStock(productId, quantity, transaction) {
  const product = await Product.findByPk(productId, { transaction, lock: transaction ? transaction.LOCK.UPDATE : undefined });
  if (!product || product.stock < quantity) {
    const err = new Error(`Insufficient stock for "${product ? product.title : 'product'}".`);
    err.status = 400;
    throw err;
  }
  product.stock -= quantity;
  await product.save({ transaction });
  return product;
}

module.exports = {
  searchProducts,
  getBySlugPublic,
  getById,
  listForSeller,
  createProduct,
  updateProduct,
  deleteProduct,
  setModerationStatus,
  decrementStock,
  PAGE_SIZE
};
