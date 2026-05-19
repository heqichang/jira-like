const { sequelize, Sequelize } = require('./index');

const TaskDependency = sequelize.define('TaskDependency', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: Sequelize.ENUM('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'),
    allowNull: false,
    defaultValue: 'finish_to_start',
  },
});

module.exports = TaskDependency;
