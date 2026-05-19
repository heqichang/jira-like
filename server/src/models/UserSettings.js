const { sequelize, Sequelize } = require('./index');

const UserSettings = sequelize.define('UserSettings', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  emailNotificationsEnabled: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  pushNotificationsEnabled: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

module.exports = UserSettings;
