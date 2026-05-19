const { sequelize, Sequelize } = require('./index');

const User = sequelize.define('User', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  nickname: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: '',
  },
  avatar: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: null,
  },
});

module.exports = User;
