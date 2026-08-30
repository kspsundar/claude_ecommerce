require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const { User, SellerProfile, Category, Product, ProductImage } = require('../models');

async function seed() {
  console.log('Resetting database and seeding sample data...');
  await sequelize.sync({ force: true });

  const hash = (pw) => bcrypt.hash(pw, 10);

  const admin = await User.create({
    name: 'Site Admin',
    email: 'admin@example.com',
    password: await hash('Admin123!'),
    role: 'admin'
  });

  const buyer = await User.create({
    name: 'Sample Buyer',
    email: 'buyer@example.com',
    password: await hash('Buyer123!'),
    role: 'buyer'
  });

  const sellerUser = await User.create({
    name: 'Sample Seller',
    email: 'seller@example.com',
    password: await hash('Seller123!'),
    role: 'seller'
  });

  const sellerProfile = await SellerProfile.create({
    userId: sellerUser.id,
    storeName: 'Demo Store',
    storeSlug: 'demo-store',
    description: 'A sample approved seller for demo purposes.',
    status: 'approved',
    commissionRate: 10
  });

  const electronics = await Category.create({ name: 'Electronics', slug: 'electronics' });
  const fashion = await Category.create({ name: 'Fashion', slug: 'fashion' });
  const home = await Category.create({ name: 'Home & Kitchen', slug: 'home-kitchen' });
  await Category.create({ name: 'Smartphones', slug: 'smartphones', parentId: electronics.id });
  await Category.create({ name: 'Laptops', slug: 'laptops', parentId: electronics.id });

  const products = [
    { title: 'Wireless Headphones', price: 59.99, stock: 40, categoryId: electronics.id, description: 'Over-ear Bluetooth headphones with noise cancellation.' },
    { title: 'Mechanical Keyboard', price: 89.5, stock: 25, categoryId: electronics.id, description: 'RGB backlit mechanical keyboard with blue switches.' },
    { title: "Men's Denim Jacket", price: 45.0, stock: 60, categoryId: fashion.id, description: 'Classic fit denim jacket, machine washable.' },
    { title: 'Ceramic Coffee Mug Set', price: 19.99, stock: 100, categoryId: home.id, description: 'Set of 4 ceramic mugs, dishwasher safe.' },
    { title: 'Stainless Steel Water Bottle', price: 15.0, stock: 80, categoryId: home.id, description: 'Insulated 1L water bottle, keeps drinks cold for 24h.' }
  ];

  for (const p of products) {
    const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const sku = `SKU-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    await Product.create({
      sellerId: sellerProfile.id,
      categoryId: p.categoryId,
      title: p.title,
      slug,
      description: p.description,
      price: p.price,
      sku,
      stock: p.stock,
      status: 'approved',
      isActive: true
    });
  }

  console.log('Seed complete.');
  console.log('---------------------------------');
  console.log('Admin login:  admin@example.com / Admin123!');
  console.log('Seller login: seller@example.com / Seller123!');
  console.log('Buyer login:  buyer@example.com / Buyer123!');
  console.log('---------------------------------');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
