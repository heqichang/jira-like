const { sequelize, Sequelize } = require('./index');

const Task = sequelize.define('Task', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  title: {
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
  priority: {
    type: Sequelize.ENUM('urgent', 'high', 'medium', 'low'),
    allowNull: false,
    defaultValue: 'medium',
  },
  type: {
    type: Sequelize.ENUM('bug', 'feature', 'task'),
    allowNull: false,
    defaultValue: 'task',
  },
  order: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
});

module.exports = Task;
