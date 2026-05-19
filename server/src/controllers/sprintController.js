const { body, param } = require('express-validator');
const { Sprint, ProjectMember, Task, Story, SprintBurndown, User } = require('../models/associations');
const { AppError } = require('../utils/errors');
const validate = require('../middlewares/validate');

const checkProjectMember = async (projectId, userId) => {
  const member = await ProjectMember.findOne({ where: { projectId, userId } });
  if (!member) throw new AppError('无权访问该项目', 403);
  return member;
};

exports.createSprint = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  body('name').notEmpty().withMessage('Sprint名称不能为空'),
  body('goal').optional(),
  body('startDate').notEmpty().isISO8601().withMessage('无效的开始日期'),
  body('endDate').notEmpty().isISO8601().withMessage('无效的结束日期'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const { name, goal, startDate, endDate } = req.body;
      const sprint = await Sprint.create({
        name,
        goal: goal || '',
        startDate,
        endDate,
        projectId: req.params.projectId,
        status: 'planned',
      });
      res.status(201).json(sprint);
    } catch (err) {
      next(err);
    }
  },
];

exports.getProjectSprints = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const sprints = await Sprint.findAll({
        where: { projectId: req.params.projectId },
        include: [
          {
            model: Task,
            as: 'tasks',
            include: [
              { model: User, as: 'assignee', attributes: ['id', 'nickname', 'avatar'] },
            ],
          },
          {
            model: Story,
            as: 'stories',
            include: [
              { model: User, as: 'assignee', attributes: ['id', 'nickname', 'avatar'] },
            ],
          },
        ],
        order: [['startDate', 'DESC']],
      });
      res.json(sprints);
    } catch (err) {
      next(err);
    }
  },
];

exports.getSprint = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('sprintId').isUUID().withMessage('无效的Sprint ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const sprint = await Sprint.findOne({
        where: { id: req.params.sprintId, projectId: req.params.projectId },
        include: [
          {
            model: Task,
            as: 'tasks',
            include: [
              { model: User, as: 'assignee', attributes: ['id', 'nickname', 'avatar'] },
            ],
          },
          {
            model: Story,
            as: 'stories',
            include: [
              { model: User, as: 'assignee', attributes: ['id', 'nickname', 'avatar'] },
            ],
          },
          { model: SprintBurndown, as: 'burndownData', order: [['date', 'ASC']] },
        ],
      });
      if (!sprint) throw new AppError('Sprint不存在', 404);
      res.json(sprint);
    } catch (err) {
      next(err);
    }
  },
];

exports.updateSprint = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('sprintId').isUUID().withMessage('无效的Sprint ID'),
  body('name').optional().notEmpty().withMessage('Sprint名称不能为空'),
  body('goal').optional(),
  body('startDate').optional().isISO8601().withMessage('无效的开始日期'),
  body('endDate').optional().isISO8601().withMessage('无效的结束日期'),
  body('status').optional().isIn(['planned', 'active', 'completed']).withMessage('无效的状态'),
  body('retrospective').optional(),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const sprint = await Sprint.findOne({
        where: { id: req.params.sprintId, projectId: req.params.projectId },
      });
      if (!sprint) throw new AppError('Sprint不存在', 404);
      
      const { name, goal, startDate, endDate, status, retrospective } = req.body;
      if (name !== undefined) sprint.name = name;
      if (goal !== undefined) sprint.goal = goal;
      if (startDate !== undefined) sprint.startDate = startDate;
      if (endDate !== undefined) sprint.endDate = endDate;
      if (status !== undefined) sprint.status = status;
      if (retrospective !== undefined) sprint.retrospective = retrospective;
      
      await sprint.save();
      res.json(sprint);
    } catch (err) {
      next(err);
    }
  },
];

exports.deleteSprint = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('sprintId').isUUID().withMessage('无效的Sprint ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const sprint = await Sprint.findOne({
        where: { id: req.params.sprintId, projectId: req.params.projectId },
      });
      if (!sprint) throw new AppError('Sprint不存在', 404);
      
      await Task.update({ sprintId: null }, { where: { sprintId: sprint.id } });
      await Story.update({ sprintId: null }, { where: { sprintId: sprint.id } });
      await SprintBurndown.destroy({ where: { sprintId: sprint.id } });
      await sprint.destroy();
      
      res.json({ message: 'Sprint已删除' });
    } catch (err) {
      next(err);
    }
  },
];

exports.addTaskToSprint = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('sprintId').isUUID().withMessage('无效的Sprint ID'),
  body('taskId').isUUID().withMessage('无效的任务ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const sprint = await Sprint.findOne({
        where: { id: req.params.sprintId, projectId: req.params.projectId },
      });
      if (!sprint) throw new AppError('Sprint不存在', 404);
      
      const task = await Task.findOne({
        where: { id: req.body.taskId, projectId: req.params.projectId },
      });
      if (!task) throw new AppError('任务不存在', 404);
      
      task.sprintId = sprint.id;
      await task.save();
      
      res.json(task);
    } catch (err) {
      next(err);
    }
  },
];

exports.removeTaskFromSprint = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('sprintId').isUUID().withMessage('无效的Sprint ID'),
  param('taskId').isUUID().withMessage('无效的任务ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const task = await Task.findOne({
        where: { id: req.params.taskId, sprintId: req.params.sprintId, projectId: req.params.projectId },
      });
      if (!task) throw new AppError('任务不存在或不在该Sprint中', 404);
      
      task.sprintId = null;
      await task.save();
      
      res.json(task);
    } catch (err) {
      next(err);
    }
  },
];

exports.addStoryToSprint = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('sprintId').isUUID().withMessage('无效的Sprint ID'),
  body('storyId').isUUID().withMessage('无效的Story ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const sprint = await Sprint.findOne({
        where: { id: req.params.sprintId, projectId: req.params.projectId },
      });
      if (!sprint) throw new AppError('Sprint不存在', 404);
      
      const story = await Story.findOne({
        where: { id: req.body.storyId, projectId: req.params.projectId },
      });
      if (!story) throw new AppError('Story不存在', 404);
      
      story.sprintId = sprint.id;
      await story.save();
      
      res.json(story);
    } catch (err) {
      next(err);
    }
  },
];

exports.removeStoryFromSprint = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('sprintId').isUUID().withMessage('无效的Sprint ID'),
  param('storyId').isUUID().withMessage('无效的Story ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const story = await Story.findOne({
        where: { id: req.params.storyId, sprintId: req.params.sprintId, projectId: req.params.projectId },
      });
      if (!story) throw new AppError('Story不存在或不在该Sprint中', 404);
      
      story.sprintId = null;
      await story.save();
      
      res.json(story);
    } catch (err) {
      next(err);
    }
  },
];

exports.recordBurndown = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('sprintId').isUUID().withMessage('无效的Sprint ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const sprint = await Sprint.findOne({
        where: { id: req.params.sprintId, projectId: req.params.projectId },
        include: [
          { model: Task, as: 'tasks' },
          { model: Story, as: 'stories' },
        ],
      });
      if (!sprint) throw new AppError('Sprint不存在', 404);

      const tasks = sprint.tasks || [];
      const stories = sprint.stories || [];
      
      const doneTasks = tasks.filter(t => t.status === 'done');
      const doneStories = stories.filter(s => s.status === 'done');
      
      const totalStoryPoints = stories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
      const completedStoryPoints = doneStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existing = await SprintBurndown.findOne({
        where: { sprintId: sprint.id, date: today },
      });
      
      const burndownData = {
        date: today,
        remainingStoryPoints: totalStoryPoints - completedStoryPoints,
        remainingTasks: tasks.length - doneTasks.length,
        completedStoryPoints,
        completedTasks: doneTasks.length,
        idealRemaining: 0,
      };
      
      if (existing) {
        Object.assign(existing, burndownData);
        await existing.save();
        res.json(existing);
      } else {
        const burndown = await SprintBurndown.create({
          ...burndownData,
          sprintId: sprint.id,
        });
        res.status(201).json(burndown);
      }
    } catch (err) {
      next(err);
    }
  },
];

exports.getBurndownData = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('sprintId').isUUID().withMessage('无效的Sprint ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      
      const burndown = await SprintBurndown.findAll({
        where: { sprintId: req.params.sprintId },
        order: [['date', 'ASC']],
      });
      
      res.json(burndown);
    } catch (err) {
      next(err);
    }
  },
];

exports.getVelocityStats = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const completedSprints = await Sprint.findAll({
        where: { projectId: req.params.projectId, status: 'completed' },
        include: [{ model: Story, as: 'stories' }],
        order: [['endDate', 'DESC']],
        limit: 10,
      });
      
      const stats = completedSprints.map(sprint => {
        const completedPoints = sprint.stories
          .filter(s => s.status === 'done')
          .reduce((sum, s) => sum + (s.storyPoints || 0), 0);
        return {
          sprintId: sprint.id,
          sprintName: sprint.name,
          completedPoints,
          endDate: sprint.endDate,
        };
      });
      
      const averageVelocity = stats.length > 0
        ? stats.reduce((sum, s) => sum + s.completedPoints, 0) / stats.length
        : 0;
      
      res.json({
        sprints: stats,
        averageVelocity,
      });
    } catch (err) {
      next(err);
    }
  },
];
