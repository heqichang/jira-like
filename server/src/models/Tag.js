const { sequelize, Sequelize } = require('./index');

const Tag = sequelize.define('Tag', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  color: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: '#6b7280',
  },
});

module.exports = Tag;
