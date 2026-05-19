const { sequelize, Sequelize } = require('./index');

const Notification = sequelize.define('Notification', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: Sequelize.ENUM('task_assigned', 'task_status_changed', 'comment_mention', 'sprint_started', 'sprint_completed'),
    allowNull: false,
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  content: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  isRead: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  readAt: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  link: {
    type: Sequelize.STRING,
    allowNull: true,
    defaultValue: '',
  },
  emailSent: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = Notification;
