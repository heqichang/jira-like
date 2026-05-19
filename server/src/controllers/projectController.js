const { body, param } = require('express-validator');
const { Project, ProjectMember, User, Task } = require('../models/associations');
const { AppError } = require('../utils/errors');
const validate = require('../middlewares/validate');

exports.createProject = [
  body('name').notEmpty().withMessage('项目名称不能为空'),
  body('description').optional(),
  body('icon').optional(),
  body('color').optional(),
  validate,
  async (req, res, next) => {
    try {
      const { name, description, icon, color } = req.body;
      const project = await Project.create({ name, description, icon, color });
      await ProjectMember.create({
        projectId: project.id,
        userId: req.user.id,
        role: 'owner',
      });
      res.status(201).json(project);
    } catch (err) {
      next(err);
    }
  },
];

exports.getMyProjects = async (req, res, next) => {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: User,
          as: 'members',
          where: { id: req.user.id },
          attributes: [],
          through: { attributes: ['role'] },
        },
      ],
      where: { isArchived: false },
      order: [['createdAt', 'DESC']],
    });
    res.json(projects);
  } catch (err) {
    next(err);
  }
};

exports.getArchivedProjects = async (req, res, next) => {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: User,
          as: 'members',
          where: { id: req.user.id },
          attributes: [],
          through: { attributes: ['role'] },
        },
      ],
      where: { isArchived: true },
      order: [['updatedAt', 'DESC']],
    });
    res.json(projects);
  } catch (err) {
    next(err);
  }
};

exports.getProject = [
  param('id').isUUID().withMessage('无效的项目ID'),
  validate,
  async (req, res, next) => {
    try {
      const project = await Project.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'members',
            attributes: ['id', 'email', 'nickname', 'avatar'],
            through: { attributes: ['role'] },
          },
        ],
      });
      if (!project) throw new AppError('项目不存在', 404);
      const isMember = project.members.some((m) => m.id === req.user.id);
      if (!isMember) throw new AppError('无权访问该项目', 403);
      res.json(project);
    } catch (err) {
      next(err);
    }
  },
];

exports.updateProject = [
  param('id').isUUID().withMessage('无效的项目ID'),
  body('name').optional().notEmpty().withMessage('项目名称不能为空'),
  body('description').optional(),
  body('icon').optional(),
  body('color').optional(),
  validate,
  async (req, res, next) => {
    try {
      const project = await Project.findByPk(req.params.id);
      if (!project) throw new AppError('项目不存在', 404);
      const member = await ProjectMember.findOne({
        where: { projectId: project.id, userId: req.user.id },
      });
      if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
        throw new AppError('无权修改该项目', 403);
      }
      const { name, description, icon, color } = req.body;
      if (name !== undefined) project.name = name;
      if (description !== undefined) project.description = description;
      if (icon !== undefined) project.icon = icon;
      if (color !== undefined) project.color = color;
      await project.save();
      res.json(project);
    } catch (err) {
      next(err);
    }
  },
];

exports.archiveProject = [
  param('id').isUUID().withMessage('无效的项目ID'),
  validate,
  async (req, res, next) => {
    try {
      const project = await Project.findByPk(req.params.id);
      if (!project) throw new AppError('项目不存在', 404);
      const member = await ProjectMember.findOne({
        where: { projectId: project.id, userId: req.user.id },
      });
      if (!member || member.role !== 'owner') {
        throw new AppError('只有项目拥有者可以归档项目', 403);
      }
      project.isArchived = true;
      await project.save();
      res.json({ message: '项目已归档' });
    } catch (err) {
      next(err);
    }
  },
];

exports.unarchiveProject = [
  param('id').isUUID().withMessage('无效的项目ID'),
  validate,
  async (req, res, next) => {
    try {
      const project = await Project.findByPk(req.params.id);
      if (!project) throw new AppError('项目不存在', 404);
      const member = await ProjectMember.findOne({
        where: { projectId: project.id, userId: req.user.id },
      });
      if (!member || member.role !== 'owner') {
        throw new AppError('只有项目拥有者可以恢复项目', 403);
      }
      project.isArchived = false;
      await project.save();
      res.json({ message: '项目已恢复' });
    } catch (err) {
      next(err);
    }
  },
];

exports.deleteProject = [
  param('id').isUUID().withMessage('无效的项目ID'),
  validate,
  async (req, res, next) => {
    try {
      const project = await Project.findByPk(req.params.id);
      if (!project) throw new AppError('项目不存在', 404);
      const member = await ProjectMember.findOne({
        where: { projectId: project.id, userId: req.user.id },
      });
      if (!member || member.role !== 'owner') {
        throw new AppError('只有项目拥有者可以删除项目', 403);
      }
      await ProjectMember.destroy({ where: { projectId: project.id } });
      await Task.destroy({ where: { projectId: project.id } });
      await project.destroy();
      res.json({ message: '项目已删除' });
    } catch (err) {
      next(err);
    }
  },
];

exports.addMember = [
  param('id').isUUID().withMessage('无效的项目ID'),
  body('userId').isUUID().withMessage('无效的用户ID'),
  body('role').optional().isIn(['admin', 'member']).withMessage('无效的角色'),
  validate,
  async (req, res, next) => {
    try {
      const project = await Project.findByPk(req.params.id);
      if (!project) throw new AppError('项目不存在', 404);
      const currentMember = await ProjectMember.findOne({
        where: { projectId: project.id, userId: req.user.id },
      });
      if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
        throw new AppError('无权添加成员', 403);
      }
      const { userId, role = 'member' } = req.body;
      const existing = await ProjectMember.findOne({
        where: { projectId: project.id, userId },
      });
      if (existing) throw new AppError('该用户已是项目成员', 409);
      await ProjectMember.create({ projectId: project.id, userId, role });
      res.status(201).json({ message: '成员添加成功' });
    } catch (err) {
      next(err);
    }
  },
];

exports.removeMember = [
  param('id').isUUID().withMessage('无效的项目ID'),
  param('userId').isUUID().withMessage('无效的用户ID'),
  validate,
  async (req, res, next) => {
    try {
      const member = await ProjectMember.findOne({
        where: { projectId: req.params.id, userId: req.params.userId },
      });
      if (!member) throw new AppError('成员不存在', 404);
      if (member.role === 'owner') throw new AppError('不能移除项目拥有者', 403);
      const currentMember = await ProjectMember.findOne({
        where: { projectId: req.params.id, userId: req.user.id },
      });
      if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
        throw new AppError('无权移除成员', 403);
      }
      await member.destroy();
      res.json({ message: '成员已移除' });
    } catch (err) {
      next(err);
    }
  },
];
