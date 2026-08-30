const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Order = require('./Order');

const OrderItem = sequelize.define('OrderItem', {
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  sellerId: { type: DataTypes.INTEGER, allowNull: false },
  titleSnapshot: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  status: {
    type: DataTypes.ENUM(...Order.STATUSES),
    defaultValue: 'placed'
  }
});

module.exports = OrderItem;
