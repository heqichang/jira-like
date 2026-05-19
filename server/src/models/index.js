const { Sequelize } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: config.db.path,
  logging: false,
});

module.exports = { sequelize, Sequelize };
