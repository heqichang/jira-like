const { sequelize, Sequelize } = require('./index');

const Sprint = sequelize.define('Sprint', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  goal: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  status: {
    type: Sequelize.ENUM('planned', 'active', 'completed'),
    allowNull: false,
    defaultValue: 'planned',
  },
  startDate: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  endDate: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  velocity: {
    type: Sequelize.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
  retrospective: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue: '',
  },
});

module.exports = Sprint;
