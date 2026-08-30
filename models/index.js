const sequelize = require('../config/database');

const User = require('./User');
const SellerProfile = require('./SellerProfile');
const Address = require('./Address');
const Category = require('./Category');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const CartItem = require('./CartItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// User <-> SellerProfile (one-to-one)
User.hasOne(SellerProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
SellerProfile.belongsTo(User, { foreignKey: 'userId' });

// User <-> Address
User.hasMany(Address, { foreignKey: 'userId', onDelete: 'CASCADE' });
Address.belongsTo(User, { foreignKey: 'userId' });

// Category self-reference (parent/subcategory)
Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

// Category <-> Product
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

// SellerProfile <-> Product
SellerProfile.hasMany(Product, { foreignKey: 'sellerId', as: 'products' });
Product.belongsTo(SellerProfile, { foreignKey: 'sellerId', as: 'seller' });

// Product <-> ProductImage
Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'images', onDelete: 'CASCADE' });
ProductImage.belongsTo(Product, { foreignKey: 'productId' });

// User <-> CartItem <-> Product
User.hasMany(CartItem, { foreignKey: 'userId', onDelete: 'CASCADE' });
CartItem.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(CartItem, { foreignKey: 'productId' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });

// User <-> Order (buyer)
User.hasMany(Order, { foreignKey: 'buyerId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });

// Address <-> Order
Address.hasMany(Order, { foreignKey: 'addressId' });
Order.belongsTo(Address, { foreignKey: 'addressId' });

// Order <-> OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// Product <-> OrderItem
Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// SellerProfile <-> OrderItem (per-seller sub-order line)
SellerProfile.hasMany(OrderItem, { foreignKey: 'sellerId', as: 'orderItems' });
OrderItem.belongsTo(SellerProfile, { foreignKey: 'sellerId', as: 'seller' });

module.exports = {
  sequelize,
  User,
  SellerProfile,
  Address,
  Category,
  Product,
  ProductImage,
  CartItem,
  Order,
  OrderItem
};
