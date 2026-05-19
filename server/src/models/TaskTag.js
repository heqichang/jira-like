const { sequelize, Sequelize } = require('./index');

const TaskTag = sequelize.define('TaskTag', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
});

module.exports = TaskTag;
