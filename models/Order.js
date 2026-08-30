const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ORDER_STATUSES = ['placed', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled'];

const Order = sequelize.define('Order', {
  buyerId: { type: DataTypes.INTEGER, allowNull: false },
  addressId: { type: DataTypes.INTEGER, allowNull: true },
  totalAmount: { type: DataTypes.FLOAT, allowNull: false },
  status: {
    type: DataTypes.ENUM(...ORDER_STATUSES),
    defaultValue: 'placed'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded'),
    defaultValue: 'pending'
  },
  shippingSnapshot: { type: DataTypes.TEXT, allowNull: true }
});

Order.STATUSES = ORDER_STATUSES;

module.exports = Order;
