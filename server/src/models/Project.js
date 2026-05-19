const { sequelize, Sequelize } = require('./index');

const Project = sequelize.define('Project', {
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
  icon: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: null,
  },
  color: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: '#6366f1',
  },
  isArchived: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = Project;
