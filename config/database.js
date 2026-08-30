const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');

const storage = process.env.DB_STORAGE || './data/database.sqlite';
const dataDir = path.dirname(path.resolve(storage));

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: false
});

module.exports = sequelize;
