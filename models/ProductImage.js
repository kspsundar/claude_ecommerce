const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductImage = sequelize.define('ProductImage', {
  productId: { type: DataTypes.INTEGER, allowNull: false },
  imagePath: { type: DataTypes.STRING, allowNull: false },
  isPrimary: { type: DataTypes.BOOLEAN, defaultValue: false }
});

module.exports = ProductImage;
