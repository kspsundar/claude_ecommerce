const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// One row per browser/device a user has granted push permission on.
const PushSubscription = sequelize.define('PushSubscription', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  endpoint: { type: DataTypes.STRING(2048), allowNull: false, unique: true },
  p256dh: { type: DataTypes.STRING, allowNull: false },
  auth: { type: DataTypes.STRING, allowNull: false },
  userAgent: { type: DataTypes.STRING, allowNull: true }
});

module.exports = PushSubscription;
