const { body, param, query } = require('express-validator');
const { Task, Comment, User, ProjectMember } = require('../models/associations');
const { AppError } = require('../utils/errors');
const validate = require('../middlewares/validate');

const checkProjectMember = async (projectId, userId) => {
  const member = await ProjectMember.findOne({ where: { projectId, userId } });
  if (!member) throw new AppError('无权访问该项目', 403);
  return member;
};

exports.createTask = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  body('title').notEmpty().withMessage('任务标题不能为空'),
  body('description').optional({ checkFalsy: true }),
  body('priority').optional({ checkFalsy: true }).isIn(['urgent', 'high', 'medium', 'low']).withMessage('无效的优先级'),
  body('type').optional({ checkFalsy: true }).isIn(['bug', 'feature', 'task']).withMessage('无效的任务类型'),
  body('assigneeId').optional({ checkFalsy: true }).isUUID().withMessage('无效的指派人ID'),
  body('parentId').optional({ checkFalsy: true }).isUUID().withMessage('无效的父任务ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const { title, description, priority, type, assigneeId, parentId } = req.body;
      if (parentId) {
        const parent = await Task.findByPk(parentId);
        if (!parent || parent.parentId) {
          throw new AppError('只支持一级子任务', 400);
        }
      }
      const maxOrder = await Task.max('order', {
        where: { projectId: req.params.projectId, status: 'todo' },
      });
      const task = await Task.create({
        title,
        description: description || '',
        priority: priority || 'medium',
        type: type || 'task',
        status: 'todo',
        order: (maxOrder || 0) + 1,
        projectId: req.params.projectId,
        creatorId: req.user.id,
        assigneeId: assigneeId || null,
        parentId: parentId || null,
      });
      const result = await Task.findByPk(task.id, {
        include: [
          { model: User, as: 'assignee', attributes: ['id', 'nickname', 'avatar'] },
          { model: User, as: 'creator', attributes: ['id', 'nickname'] },
          { model: Task, as: 'subtasks' },
        ],
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
];

exports.getProjectTasks = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  query('status').optional().isIn(['todo', 'in_progress', 'done']),
  query('priority').optional().isIn(['urgent', 'high', 'medium', 'low']),
  query('type').optional().isIn(['bug', 'feature', 'task']),
  query('assigneeId').optional().isUUID(),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const where = { projectId: req.params.projectId, parentId: null };
      const { status, priority, type, assigneeId } = req.query;
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (type) where.type = type;
      if (assigneeId) where.assigneeId = assigneeId;

      const tasks = await Task.findAll({
        where,
        include: [
          { model: User, as: 'assignee', attributes: ['id', 'nickname', 'avatar'] },
          { model: User, as: 'creator', attributes: ['id', 'nickname'] },
          { model: Task, as: 'subtasks', include: [
            { model: User, as: 'assignee', attributes: ['id', 'nickname', 'avatar'] },
          ]},
        ],
        order: [['order', 'ASC'], ['createdAt', 'DESC']],
      });
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  },
];

exports.getTask = [
  param('projectId').isUUID(),
  param('taskId').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const task = await Task.findOne({
        where: { id: req.params.taskId, projectId: req.params.projectId },
        include: [
          { model: User, as: 'assignee', attributes: ['id', 'nickname', 'avatar'] },
          { model: User, as: 'creator', attributes: ['id', 'nickname'] },
          { model: Task, as: 'subtasks', include: [
            { model: User, as: 'assignee', attributes: ['id', 'nickname', 'avatar'] },
          ]},
          { model: Comment, as: 'comments', include: [
            { model: User, as: 'author', attributes: ['id', 'nickname', 'avatar'] },
          ], order: [['createdAt', 'ASC']] },
        ],
      });
      if (!task) throw new AppError('任务不存在', 404);
      res.json(task);
    } catch (err) {
      next(err);
    }
  },
];

exports.updateTask = [
  param('projectId').isUUID(),
  param('taskId').isUUID(),
  body('title').optional().notEmpty().withMessage('任务标题不能为空'),
  body('description').optional({ checkFalsy: true }),
  body('status').optional({ checkFalsy: true }).isIn(['todo', 'in_progress', 'done']).withMessage('无效的状态'),
  body('priority').optional({ checkFalsy: true }).isIn(['urgent', 'high', 'medium', 'low']),
  body('type').optional({ checkFalsy: true }).isIn(['bug', 'feature', 'task']),
  body('assigneeId').optional({ checkFalsy: true }).isUUID(),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const task = await Task.findOne({
        where: { id: req.params.taskId, projectId: req.params.projectId },
      });
      if (!task) throw new AppError('任务不存在', 404);
      const { title, description, status, priority, type, assigneeId } = req.body;
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status;
      if (priority !== undefined) task.priority = priority;
      if (type !== undefined) task.type = type;
      if (assigneeId !== undefined) task.assigneeId = assigneeId || null;
      await task.save();
      const result = await Task.findByPk(task.id, {
        include: [
          { model: User, as: 'assignee', attributes: ['id', 'nickname', 'avatar'] },
          { model: User, as: 'creator', attributes: ['id', 'nickname'] },
          { model: Task, as: 'subtasks', include: [
            { model: User, as: 'assignee', attributes: ['id', 'nickname', 'avatar'] },
          ]},
        ],
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
];

exports.deleteTask = [
  param('projectId').isUUID(),
  param('taskId').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const task = await Task.findOne({
        where: { id: req.params.taskId, projectId: req.params.projectId },
      });
      if (!task) throw new AppError('任务不存在', 404);
      await Comment.destroy({ where: { taskId: task.id } });
      await Task.destroy({ where: { parentId: task.id } });
      await task.destroy();
      res.json({ message: '任务已删除' });
    } catch (err) {
      next(err);
    }
  },
];

exports.batchUpdateOrder = [
  param('projectId').isUUID(),
  body('tasks').isArray().withMessage('tasks必须是数组'),
  body('tasks.*.id').isUUID().withMessage('无效的任务ID'),
  body('tasks.*.status').isIn(['todo', 'in_progress', 'done']).withMessage('无效的状态'),
  body('tasks.*.order').isInt().withMessage('order必须是整数'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const { tasks } = req.body;
      for (const t of tasks) {
        await Task.update(
          { status: t.status, order: t.order },
          { where: { id: t.id, projectId: req.params.projectId } }
        );
      }
      res.json({ message: '排序已更新' });
    } catch (err) {
      next(err);
    }
  },
];

exports.createComment = [
  param('projectId').isUUID(),
  param('taskId').isUUID(),
  body('content').notEmpty().withMessage('评论内容不能为空'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const task = await Task.findOne({
        where: { id: req.params.taskId, projectId: req.params.projectId },
      });
      if (!task) throw new AppError('任务不存在', 404);
      const comment = await Comment.create({
        content: req.body.content,
        taskId: task.id,
        authorId: req.user.id,
      });
      const result = await Comment.findByPk(comment.id, {
        include: [{ model: User, as: 'author', attributes: ['id', 'nickname', 'avatar'] }],
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
];

exports.getComments = [
  param('projectId').isUUID(),
  param('taskId').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const comments = await Comment.findAll({
        where: { taskId: req.params.taskId },
        include: [{ model: User, as: 'author', attributes: ['id', 'nickname', 'avatar'] }],
        order: [['createdAt', 'ASC']],
      });
      res.json(comments);
    } catch (err) {
      next(err);
    }
  },
];

exports.deleteComment = [
  param('projectId').isUUID(),
  param('taskId').isUUID(),
  param('commentId').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const comment = await Comment.findOne({
        where: { id: req.params.commentId, taskId: req.params.taskId },
      });
      if (!comment) throw new AppError('评论不存在', 404);
      if (comment.authorId !== req.user.id) {
        throw new AppError('只能删除自己的评论', 403);
      }
      await comment.destroy();
      res.json({ message: '评论已删除' });
    } catch (err) {
      next(err);
    }
  },
];
