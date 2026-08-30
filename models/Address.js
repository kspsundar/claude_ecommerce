const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Address = sequelize.define('Address', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  label: { type: DataTypes.STRING, defaultValue: 'Home' },
  line1: { type: DataTypes.STRING, allowNull: false },
  line2: { type: DataTypes.STRING, allowNull: true },
  city: { type: DataTypes.STRING, allowNull: false },
  state: { type: DataTypes.STRING, allowNull: false },
  postalCode: { type: DataTypes.STRING, allowNull: false },
  country: { type: DataTypes.STRING, allowNull: false },
  isDefault: { type: DataTypes.BOOLEAN, defaultValue: false }
});

module.exports = Address;
