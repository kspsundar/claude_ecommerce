const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SellerProfile = sequelize.define('SellerProfile', {
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  storeName: { type: DataTypes.STRING, allowNull: false },
  storeSlug: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'suspended'),
    defaultValue: 'pending'
  },
  documentPath: { type: DataTypes.STRING, allowNull: true },
  bankAccountName: { type: DataTypes.STRING, allowNull: true },
  bankAccountNumber: { type: DataTypes.STRING, allowNull: true },
  bankIFSC: { type: DataTypes.STRING, allowNull: true },
  commissionRate: { type: DataTypes.FLOAT, defaultValue: 10.0 }
});

module.exports = SellerProfile;
