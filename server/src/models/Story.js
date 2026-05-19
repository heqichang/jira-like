const { sequelize, Sequelize } = require('./index');

const Story = sequelize.define('Story', {
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
  storyPoints: {
    type: Sequelize.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
  status: {
    type: Sequelize.ENUM('backlog', 'todo', 'in_progress', 'done'),
    allowNull: false,
    defaultValue: 'backlog',
  },
  priority: {
    type: Sequelize.ENUM('urgent', 'high', 'medium', 'low'),
    allowNull: false,
    defaultValue: 'medium',
  },
  acceptanceCriteria: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  order: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
});

module.exports = Story;
