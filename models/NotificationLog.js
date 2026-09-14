const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Audit trail of every email/push notification the app attempted to send.
const NotificationLog = sequelize.define('NotificationLog', {
  userId: { type: DataTypes.INTEGER, allowNull: true }, // recipient; null if the recipient user was later deleted
  channel: { type: DataTypes.ENUM('email', 'push'), allowNull: false },
  event: { type: DataTypes.STRING, allowNull: false }, // e.g. 'user_registered', 'admin_new_signup_alert'
  title: { type: DataTypes.STRING, allowNull: true },
  message: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.ENUM('sent', 'failed'), allowNull: false, defaultValue: 'sent' },
  errorMessage: { type: DataTypes.TEXT, allowNull: true }
});

module.exports = NotificationLog;
