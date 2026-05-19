const { sequelize, Sequelize } = require('./index');

const Comment = sequelize.define('Comment', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  content: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
});

module.exports = Comment;
