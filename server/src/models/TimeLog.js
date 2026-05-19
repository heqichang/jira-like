const { sequelize, Sequelize } = require('./index');

const TimeLog = sequelize.define('TimeLog', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  hours: {
    type: Sequelize.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  logDate: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  isEstimate: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = TimeLog;
