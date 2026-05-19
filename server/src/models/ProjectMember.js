const { sequelize, Sequelize } = require('./index');

const ProjectMember = sequelize.define('ProjectMember', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  role: {
    type: Sequelize.ENUM('owner', 'admin', 'member'),
    allowNull: false,
    defaultValue: 'member',
  },
});

module.exports = ProjectMember;
