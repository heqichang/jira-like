const { body, param, query } = require('express-validator');
const { TimeLog, Task, ProjectMember, User } = require('../models/associations');
const { AppError } = require('../utils/errors');
const validate = require('../middlewares/validate');
const { Op } = require('sequelize');

const checkProjectMember = async (projectId, userId) => {
  const member = await ProjectMember.findOne({ where: { projectId, userId } });
  if (!member) throw new AppError('无权访问该项目', 403);
  return member;
};

exports.createTimeLog = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('taskId').isUUID().withMessage('无效的任务ID'),
  body('hours').isFloat({ min: 0.25 }).withMessage('工时必须大于0.25小时'),
  body('description').optional(),
  body('logDate').isISO8601().withMessage('无效的日期'),
  body('isEstimate').optional().isBoolean(),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const task = await Task.findOne({
        where: { id: req.params.taskId, projectId: req.params.projectId },
      });
      if (!task) throw new AppError('任务不存在', 404);
      
      const { hours, description, logDate, isEstimate } = req.body;
      const timeLog = await TimeLog.create({
        hours,
        description: description || '',
        logDate,
        isEstimate: isEstimate || false,
        taskId: req.params.taskId,
        userId: req.user.id,
      });
      
      const result = await TimeLog.findByPk(timeLog.id, {
        include: [{ model: User, as: 'user', attributes: ['id', 'nickname', 'avatar'] }],
      });
      
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
];

exports.getTaskTimeLogs = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('taskId').isUUID().withMessage('无效的任务ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const task = await Task.findOne({
        where: { id: req.params.taskId, projectId: req.params.projectId },
      });
      if (!task) throw new AppError('任务不存在', 404);
      
      const timeLogs = await TimeLog.findAll({
        where: { taskId: req.params.taskId },
        include: [{ model: User, as: 'user', attributes: ['id', 'nickname', 'avatar'] }],
        order: [['logDate', 'DESC'], ['createdAt', 'DESC']],
      });
      
      const totalActual = timeLogs
        .filter(t => !t.isEstimate)
        .reduce((sum, t) => sum + t.hours, 0);
      const totalEstimate = timeLogs
        .filter(t => t.isEstimate)
        .reduce((sum, t) => sum + t.hours, 0);
      
      res.json({
        timeLogs,
        summary: {
          totalActualHours: totalActual,
          totalEstimatedHours: totalEstimate,
          totalHours: totalActual + totalEstimate,
        },
      });
    } catch (err) {
      next(err);
    }
  },
];

exports.updateTimeLog = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('taskId').isUUID().withMessage('无效的任务ID'),
  param('timeLogId').isUUID().withMessage('无效的工时记录ID'),
  body('hours').optional().isFloat({ min: 0.25 }).withMessage('工时必须大于0.25小时'),
  body('description').optional(),
  body('logDate').optional().isISO8601().withMessage('无效的日期'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const timeLog = await TimeLog.findOne({
        where: { id: req.params.timeLogId, taskId: req.params.taskId },
      });
      if (!timeLog) throw new AppError('工时记录不存在', 404);
      
      if (timeLog.userId !== req.user.id) {
        throw new AppError('只能修改自己的工时记录', 403);
      }
      
      const { hours, description, logDate } = req.body;
      if (hours !== undefined) timeLog.hours = hours;
      if (description !== undefined) timeLog.description = description;
      if (logDate !== undefined) timeLog.logDate = logDate;
      
      await timeLog.save();
      
      const result = await TimeLog.findByPk(timeLog.id, {
        include: [{ model: User, as: 'user', attributes: ['id', 'nickname', 'avatar'] }],
      });
      
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
];

exports.deleteTimeLog = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('taskId').isUUID().withMessage('无效的任务ID'),
  param('timeLogId').isUUID().withMessage('无效的工时记录ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const timeLog = await TimeLog.findOne({
        where: { id: req.params.timeLogId, taskId: req.params.taskId },
      });
      if (!timeLog) throw new AppError('工时记录不存在', 404);
      
      if (timeLog.userId !== req.user.id) {
        throw new AppError('只能删除自己的工时记录', 403);
      }
      
      await timeLog.destroy();
      res.json({ message: '工时记录已删除' });
    } catch (err) {
      next(err);
    }
  },
];

exports.getProjectTimeLogs = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('userId').optional().isUUID(),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      
      const { startDate, endDate, userId } = req.query;
      const where = {};
      
      if (startDate || endDate) {
        where.logDate = {};
        if (startDate) where.logDate[Op.gte] = new Date(startDate);
        if (endDate) where.logDate[Op.lte] = new Date(endDate);
      }
      if (userId) where.userId = userId;
      
      const timeLogs = await TimeLog.findAll({
        where,
        include: [
          { model: User, as: 'user', attributes: ['id', 'nickname', 'avatar'] },
          { model: Task, as: 'task', attributes: ['id', 'title'], where: { projectId: req.params.projectId } },
        ],
        order: [['logDate', 'DESC'], ['createdAt', 'DESC']],
      });
      
      const byUser = {};
      let totalHours = 0;
      
      for (const log of timeLogs) {
        if (!log.isEstimate) {
          totalHours += log.hours;
          if (!byUser[log.userId]) {
            byUser[log.userId] = {
              user: log.user,
              totalHours: 0,
              logs: [],
            };
          }
          byUser[log.userId].totalHours += log.hours;
          byUser[log.userId].logs.push(log);
        }
      }
      
      res.json({
        timeLogs,
        summary: {
          totalHours,
          byUser: Object.values(byUser),
        },
      });
    } catch (err) {
      next(err);
    }
  },
];

exports.getMyTimeLogs = [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('projectId').optional().isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const { startDate, endDate, projectId } = req.query;
      const where = { userId: req.user.id };
      
      if (startDate || endDate) {
        where.logDate = {};
        if (startDate) where.logDate[Op.gte] = new Date(startDate);
        if (endDate) where.logDate[Op.lte] = new Date(endDate);
      }
      
      const taskWhere = {};
      if (projectId) taskWhere.projectId = projectId;
      
      const timeLogs = await TimeLog.findAll({
        where,
        include: [
          { model: Task, as: 'task', attributes: ['id', 'title', 'projectId'], where: taskWhere },
        ],
        order: [['logDate', 'DESC'], ['createdAt', 'DESC']],
      });
      
      const byDate = {};
      let totalHours = 0;
      
      for (const log of timeLogs) {
        if (!log.isEstimate) {
          totalHours += log.hours;
          const dateKey = new Date(log.logDate).toISOString().split('T')[0];
          if (!byDate[dateKey]) {
            byDate[dateKey] = {
              date: dateKey,
              totalHours: 0,
              logs: [],
            };
          }
          byDate[dateKey].totalHours += log.hours;
          byDate[dateKey].logs.push(log);
        }
      }
      
      res.json({
        timeLogs,
        summary: {
          totalHours,
          byDate: Object.values(byDate).sort((a, b) => b.date.localeCompare(a.date)),
        },
      });
    } catch (err) {
      next(err);
    }
  },
];

exports.getTimeReports = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  query('period').isIn(['week', 'month']).withMessage('period必须是week或month'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      
      const { period } = req.query;
      const now = new Date();
      let startDate;
      
      if (period === 'week') {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
      } else {
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
      }
      
      const timeLogs = await TimeLog.findAll({
        where: {
          logDate: { [Op.gte]: startDate },
        },
        include: [
          { model: User, as: 'user', attributes: ['id', 'nickname', 'avatar'] },
          { model: Task, as: 'task', attributes: ['id', 'title'], where: { projectId: req.params.projectId } },
        ],
      });
      
      const dailyStats = {};
      const userStats = {};
      
      for (const log of timeLogs) {
        if (log.isEstimate) continue;
        
        const dateKey = new Date(log.logDate).toISOString().split('T')[0];
        
        if (!dailyStats[dateKey]) {
          dailyStats[dateKey] = { date: dateKey, hours: 0 };
        }
        dailyStats[dateKey].hours += log.hours;
        
        if (!userStats[log.userId]) {
          userStats[log.userId] = { user: log.user, hours: 0 };
        }
        userStats[log.userId].hours += log.hours;
      }
      
      res.json({
        period,
        startDate,
        endDate: now,
        dailyStats: Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date)),
        userStats: Object.values(userStats).sort((a, b) => b.hours - a.hours),
      });
    } catch (err) {
      next(err);
    }
  },
];
