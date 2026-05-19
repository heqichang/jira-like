const { sequelize, Sequelize } = require('./index');

const Epic = sequelize.define('Epic', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  status: {
    type: Sequelize.ENUM('todo', 'in_progress', 'done'),
    allowNull: false,
    defaultValue: 'todo',
  },
  color: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: '#8b5cf6',
  },
  startDate: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  endDate: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  totalStoryPoints: {
    type: Sequelize.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
});

module.exports = Epic;
