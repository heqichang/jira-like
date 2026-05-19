const { body, param } = require('express-validator');
const { Tag, Task, TaskTag, ProjectMember } = require('../models/associations');
const { AppError } = require('../utils/errors');
const validate = require('../middlewares/validate');

const checkProjectMember = async (projectId, userId) => {
  const member = await ProjectMember.findOne({ where: { projectId, userId } });
  if (!member) throw new AppError('无权访问该项目', 403);
  return member;
};

exports.createTag = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  body('name').notEmpty().withMessage('标签名称不能为空'),
  body('color').optional(),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const { name, color } = req.body;
      
      const existing = await Tag.findOne({
        where: { name, projectId: req.params.projectId },
      });
      if (existing) throw new AppError('标签名称已存在', 409);
      
      const tag = await Tag.create({
        name,
        color: color || '#6b7280',
        projectId: req.params.projectId,
      });
      res.status(201).json(tag);
    } catch (err) {
      next(err);
    }
  },
];

exports.getProjectTags = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const tags = await Tag.findAll({
        where: { projectId: req.params.projectId },
        include: [{ model: Task, as: 'tasks', attributes: ['id'] }],
        order: [['name', 'ASC']],
      });
      
      const tagsWithCount = tags.map(tag => ({
        ...tag.toJSON(),
        taskCount: tag.tasks ? tag.tasks.length : 0,
      }));
      
      res.json(tagsWithCount);
    } catch (err) {
      next(err);
    }
  },
];

exports.updateTag = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('tagId').isUUID().withMessage('无效的标签ID'),
  body('name').optional().notEmpty().withMessage('标签名称不能为空'),
  body('color').optional(),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const tag = await Tag.findOne({
        where: { id: req.params.tagId, projectId: req.params.projectId },
      });
      if (!tag) throw new AppError('标签不存在', 404);
      
      const { name, color } = req.body;
      if (name !== undefined) {
        const existing = await Tag.findOne({
          where: { name, projectId: req.params.projectId, id: { [require('sequelize').Op.ne]: tag.id } },
        });
        if (existing) throw new AppError('标签名称已存在', 409);
        tag.name = name;
      }
      if (color !== undefined) tag.color = color;
      
      await tag.save();
      res.json(tag);
    } catch (err) {
      next(err);
    }
  },
];

exports.deleteTag = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('tagId').isUUID().withMessage('无效的标签ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const tag = await Tag.findOne({
        where: { id: req.params.tagId, projectId: req.params.projectId },
      });
      if (!tag) throw new AppError('标签不存在', 404);
      
      await TaskTag.destroy({ where: { tagId: tag.id } });
      await tag.destroy();
      
      res.json({ message: '标签已删除' });
    } catch (err) {
      next(err);
    }
  },
];

exports.addTagToTask = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('taskId').isUUID().withMessage('无效的任务ID'),
  body('tagId').isUUID().withMessage('无效的标签ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      
      const tag = await Tag.findOne({
        where: { id: req.body.tagId, projectId: req.params.projectId },
      });
      if (!tag) throw new AppError('标签不存在', 404);
      
      const task = await Task.findOne({
        where: { id: req.params.taskId, projectId: req.params.projectId },
      });
      if (!task) throw new AppError('任务不存在', 404);
      
      const existing = await TaskTag.findOne({
        where: { taskId: req.params.taskId, tagId: req.body.tagId },
      });
      if (existing) throw new AppError('任务已有该标签', 409);
      
      await TaskTag.create({
        taskId: req.params.taskId,
        tagId: req.body.tagId,
      });
      
      res.json({ message: '标签已添加到任务' });
    } catch (err) {
      next(err);
    }
  },
];

exports.removeTagFromTask = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('taskId').isUUID().withMessage('无效的任务ID'),
  param('tagId').isUUID().withMessage('无效的标签ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      
      const taskTag = await TaskTag.findOne({
        where: { taskId: req.params.taskId, tagId: req.params.tagId },
      });
      if (!taskTag) throw new AppError('任务没有该标签', 404);
      
      await taskTag.destroy();
      res.json({ message: '标签已从任务移除' });
    } catch (err) {
      next(err);
    }
  },
];

exports.getTaskTags = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('taskId').isUUID().withMessage('无效的任务ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      
      const task = await Task.findOne({
        where: { id: req.params.taskId, projectId: req.params.projectId },
        include: [{ model: Tag, as: 'tags' }],
      });
      if (!task) throw new AppError('任务不存在', 404);
      
      res.json(task.tags || []);
    } catch (err) {
      next(err);
    }
  },
];
