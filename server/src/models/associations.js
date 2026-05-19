const { sequelize } = require('./index');
const User = require('./User');
const UserSettings = require('./UserSettings');
const Project = require('./Project');
const ProjectMember = require('./ProjectMember');
const Task = require('./Task');
const Comment = require('./Comment');
const Sprint = require('./Sprint');
const Epic = require('./Epic');
const Story = require('./Story');
const TimeLog = require('./TimeLog');
const Tag = require('./Tag');
const TaskTag = require('./TaskTag');
const Notification = require('./Notification');
const TaskDependency = require('./TaskDependency');
const SprintBurndown = require('./SprintBurndown');

Project.belongsToMany(User, {
  through: ProjectMember,
  foreignKey: 'projectId',
  otherKey: 'userId',
  as: 'members',
});
User.belongsToMany(Project, {
  through: ProjectMember,
  foreignKey: 'userId',
  otherKey: 'projectId',
  as: 'projects',
});

User.hasOne(UserSettings, { foreignKey: 'userId', as: 'settings' });
UserSettings.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });
User.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });

Task.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

Task.hasMany(Task, { foreignKey: 'parentId', as: 'subtasks' });
Task.belongsTo(Task, { foreignKey: 'parentId', as: 'parent' });

Task.hasMany(Comment, { foreignKey: 'taskId', as: 'comments' });
Comment.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

Project.hasMany(Sprint, { foreignKey: 'projectId', as: 'sprints' });
Sprint.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

Sprint.hasMany(Task, { foreignKey: 'sprintId', as: 'tasks' });
Task.belongsTo(Sprint, { foreignKey: 'sprintId', as: 'sprint' });

Sprint.hasMany(SprintBurndown, { foreignKey: 'sprintId', as: 'burndownData' });
SprintBurndown.belongsTo(Sprint, { foreignKey: 'sprintId', as: 'sprint' });

Project.hasMany(Epic, { foreignKey: 'projectId', as: 'epics' });
Epic.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

Epic.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

Epic.hasMany(Story, { foreignKey: 'epicId', as: 'stories' });
Story.belongsTo(Epic, { foreignKey: 'epicId', as: 'epic' });

Story.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Project.hasMany(Story, { foreignKey: 'projectId', as: 'stories' });

Story.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });
Story.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });
Story.belongsTo(Sprint, { foreignKey: 'sprintId', as: 'sprint' });
Sprint.hasMany(Story, { foreignKey: 'sprintId', as: 'stories' });

Story.hasMany(Task, { foreignKey: 'storyId', as: 'tasks' });
Task.belongsTo(Story, { foreignKey: 'storyId', as: 'story' });

Task.belongsTo(Epic, { foreignKey: 'epicId', as: 'epic' });
Epic.hasMany(Task, { foreignKey: 'epicId', as: 'tasks' });

Task.hasMany(TimeLog, { foreignKey: 'taskId', as: 'timeLogs' });
TimeLog.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

TimeLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(TimeLog, { foreignKey: 'userId', as: 'timeLogs' });

Project.hasMany(Tag, { foreignKey: 'projectId', as: 'tags' });
Tag.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

Task.belongsToMany(Tag, { through: TaskTag, foreignKey: 'taskId', otherKey: 'tagId', as: 'tags' });
Tag.belongsToMany(Task, { through: TaskTag, foreignKey: 'tagId', otherKey: 'taskId', as: 'tasks' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Task.hasMany(TaskDependency, { foreignKey: 'taskId', as: 'dependencies' });
TaskDependency.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
TaskDependency.belongsTo(Task, { foreignKey: 'dependsOnTaskId', as: 'dependsOnTask' });

module.exports = {
  sequelize,
  User,
  UserSettings,
  Project,
  ProjectMember,
  Task,
  Comment,
  Sprint,
  Epic,
  Story,
  TimeLog,
  Tag,
  TaskTag,
  Notification,
  TaskDependency,
  SprintBurndown,
};
