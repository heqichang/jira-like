const { sequelize, Sequelize } = require('./index');

const SprintBurndown = sequelize.define('SprintBurndown', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  date: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  remainingStoryPoints: {
    type: Sequelize.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  remainingTasks: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  completedStoryPoints: {
    type: Sequelize.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  completedTasks: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  idealRemaining: {
    type: Sequelize.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
});

module.exports = SprintBurndown;
