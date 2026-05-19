const { body, param } = require('express-validator');
const { Epic, Story, Task, ProjectMember, User } = require('../models/associations');
const { AppError } = require('../utils/errors');
const validate = require('../middlewares/validate');

const checkProjectMember = async (projectId, userId) => {
  const member = await ProjectMember.findOne({ where: { projectId, userId } });
  if (!member) throw new AppError('无权访问该项目', 403);
  return member;
};

exports.createEpic = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  body('name').notEmpty().withMessage('Epic名称不能为空'),
  body('description').optional(),
  body('color').optional(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const { name, description, color, startDate, endDate } = req.body;
      const epic = await Epic.create({
        name,
        description: description || '',
        color: color || '#8b5cf6',
        startDate: startDate || null,
        endDate: endDate || null,
        projectId: req.params.projectId,
        creatorId: req.user.id,
      });
      res.status(201).json(epic);
    } catch (err) {
      next(err);
    }
  },
];

exports.getProjectEpics = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const epics = await Epic.findAll({
        where: { projectId: req.params.projectId },
        include: [
          {
            model: Story,
            as: 'stories',
            include: [
              { model: User, as: 'assignee', attributes: ['id', 'nickname', 'avatar'] },
            ],
          },
          {
            model: Task,
            as: 'tasks',
            include: [
              { model: User, as: 'assignee', attributes: ['id', 'nickname', 'avatar'] },
            ],
          },
          { model: User, as: 'creator', attributes: ['id', 'nickname', 'avatar'] },
        ],
        order: [['createdAt', 'DESC']],
      });
      
      const epicsWithStats = epics.map(epic => {
        const stories = epic.stories || [];
        const doneStories = stories.filter(s => s.status === 'done');
        const totalPoints = stories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
        const completedPoints = doneStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
        
        return {
          ...epic.toJSON(),
          totalStories: stories.length,
          completedStories: doneStories.length,
          totalStoryPoints: totalPoints,
          completedStoryPoints: completedPoints,
          progress: totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0,
        };
      });
      
      res.json(epicsWithStats);
    } catch (err) {
      next(err);
    }
  },
];

exports.getEpic = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('epicId').isUUID().withMessage('无效的Epic ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const epic = await Epic.findOne({
        where: { id: req.params.epicId, projectId: req.params.projectId },
        include: [
          {
            model: Story,
            as: 'stories',
            include: [
              { model: User, as: 'assignee', attributes: ['id', 'nickname', 'avatar'] },
              { model: User, as: 'creator', attributes: ['id', 'nickname'] },
            ],
            order: [['order', 'ASC']],
          },
          {
            model: Task,
            as: 'tasks',
            include: [
              { model: User, as: 'assignee', attributes: ['id', 'nickname', 'avatar'] },
            ],
          },
          { model: User, as: 'creator', attributes: ['id', 'nickname', 'avatar'] },
        ],
      });
      if (!epic) throw new AppError('Epic不存在', 404);
      res.json(epic);
    } catch (err) {
      next(err);
    }
  },
];

exports.updateEpic = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('epicId').isUUID().withMessage('无效的Epic ID'),
  body('name').optional().notEmpty().withMessage('Epic名称不能为空'),
  body('description').optional(),
  body('color').optional(),
  body('status').optional().isIn(['todo', 'in_progress', 'done']),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const epic = await Epic.findOne({
        where: { id: req.params.epicId, projectId: req.params.projectId },
      });
      if (!epic) throw new AppError('Epic不存在', 404);
      
      const { name, description, color, status, startDate, endDate } = req.body;
      if (name !== undefined) epic.name = name;
      if (description !== undefined) epic.description = description;
      if (color !== undefined) epic.color = color;
      if (status !== undefined) epic.status = status;
      if (startDate !== undefined) epic.startDate = startDate;
      if (endDate !== undefined) epic.endDate = endDate;
      
      await epic.save();
      res.json(epic);
    } catch (err) {
      next(err);
    }
  },
];

exports.deleteEpic = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('epicId').isUUID().withMessage('无效的Epic ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const epic = await Epic.findOne({
        where: { id: req.params.epicId, projectId: req.params.projectId },
      });
      if (!epic) throw new AppError('Epic不存在', 404);
      
      await Story.update({ epicId: null }, { where: { epicId: epic.id } });
      await Task.update({ epicId: null }, { where: { epicId: epic.id } });
      await epic.destroy();
      
      res.json({ message: 'Epic已删除' });
    } catch (err) {
      next(err);
    }
  },
];

exports.createStory = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('epicId').isUUID().withMessage('无效的Epic ID'),
  body('title').notEmpty().withMessage('Story标题不能为空'),
  body('description').optional(),
  body('storyPoints').optional().isFloat({ min: 0 }),
  body('priority').optional().isIn(['urgent', 'high', 'medium', 'low']),
  body('acceptanceCriteria').optional(),
  body('assigneeId').optional().isUUID(),
  body('sprintId').optional().isUUID(),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const epic = await Epic.findOne({
        where: { id: req.params.epicId, projectId: req.params.projectId },
      });
      if (!epic) throw new AppError('Epic不存在', 404);
      
      const { title, description, storyPoints, priority, acceptanceCriteria, assigneeId, sprintId } = req.body;
      
      const maxOrder = await Story.max('order', {
        where: { projectId: req.params.projectId },
      });
      
      const story = await Story.create({
        title,
        description: description || '',
        storyPoints: storyPoints || 0,
        priority: priority || 'medium',
        acceptanceCriteria: acceptanceCriteria || '',
        status: 'backlog',
        order: (maxOrder || 0) + 1,
        projectId: req.params.projectId,
        epicId: req.params.epicId,
        creatorId: req.user.id,
        assigneeId: assigneeId || null,
        sprintId: sprintId || null,
      });
      
      const result = await Story.findByPk(story.id, {
        include: [
          { model: User, as: 'assignee', attributes: ['id', 'nickname', 'avatar'] },
          { model: User, as: 'creator', attributes: ['id', 'nickname'] },
          { model: Epic, as: 'epic', attributes: ['id', 'name', 'color'] },
        ],
      });
      
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
];

exports.createStoryWithoutEpic = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  body('title').notEmpty().withMessage('Story标题不能为空'),
  body('description').optional(),
  body('storyPoints').optional().isFloat({ min: 0 }),
  body('priority').optional().isIn(['urgent', 'high', 'medium', 'low']),
  body('status').optional().isIn(['backlog', 'todo', 'in_progress', 'done']),
  body('acceptanceCriteria').optional(),
  body('assigneeId').optional().isUUID(),
  body('sprintId').optional().isUUID(),
  body('epicId').optional().isUUID().withMessage('无效的Epic ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      
      const { title, description, storyPoints, priority, acceptanceCriteria, assigneeId, sprintId, epicId } = req.body;
      
      if (epicId) {
        const epic = await Epic.findOne({
          where: { id: epicId, projectId: req.params.projectId },
        });
        if (!epic) throw new AppError('Epic不存在', 404);
      }
      
      const maxOrder = await Story.max('order', {
        where: { projectId: req.params.projectId },
      });
      
      const story = await Story.create({
        title,
        description: description || '',
        storyPoints: storyPoints || 0,
        priority: priority || 'medium',
        acceptanceCriteria: acceptanceCriteria || '',
        status: 'backlog',
        order: (maxOrder || 0) + 1,
        projectId: req.params.projectId,
        epicId: epicId || null,
        creatorId: req.user.id,
        assigneeId: assigneeId || null,
        sprintId: sprintId || null,
      });
      
      const result = await Story.findByPk(story.id, {
        include: [
          { model: User, as: 'assignee', attributes: ['id', 'nickname', 'avatar'] },
          { model: User, as: 'creator', attributes: ['id', 'nickname'] },
          { model: Epic, as: 'epic', attributes: ['id', 'name', 'color'] },
          { model: Sprint, as: 'sprint', attributes: ['id', 'name', 'status'] },
        ],
      });
      
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
];

exports.getProjectStories = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const { status, epicId, sprintId, assigneeId } = req.query;
      const where = { projectId: req.params.projectId };
      if (status) where.status = status;
      if (epicId) where.epicId = epicId;
      if (sprintId) where.sprintId = sprintId;
      if (assigneeId) where.assigneeId = assigneeId;
      
      const stories = await Story.findAll({
        where,
        include: [
          { model: User, as: 'assignee', attributes: ['id', 'nickname', 'avatar'] },
          { model: User, as: 'creator', attributes: ['id', 'nickname'] },
          { model: Epic, as: 'epic', attributes: ['id', 'name', 'color'] },
          { model: Sprint, as: 'sprint', attributes: ['id', 'name', 'status'] },
          {
            model: Task,
            as: 'tasks',
            include: [
              { model: User, as: 'assignee', attributes: ['id', 'nickname', 'avatar'] },
            ],
          },
        ],
        order: [['order', 'ASC'], ['createdAt', 'DESC']],
      });
      res.json(stories);
    } catch (err) {
      next(err);
    }
  },
];

exports.getStory = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('storyId').isUUID().withMessage('无效的Story ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const story = await Story.findOne({
        where: { id: req.params.storyId, projectId: req.params.projectId },
        include: [
          { model: User, as: 'assignee', attributes: ['id', 'nickname', 'avatar'] },
          { model: User, as: 'creator', attributes: ['id', 'nickname'] },
          { model: Epic, as: 'epic', attributes: ['id', 'name', 'color'] },
          { model: Sprint, as: 'sprint', attributes: ['id', 'name', 'status'] },
          {
            model: Task,
            as: 'tasks',
            include: [
              { model: User, as: 'assignee', attributes: ['id', 'nickname', 'avatar'] },
            ],
          },
        ],
      });
      if (!story) throw new AppError('Story不存在', 404);
      res.json(story);
    } catch (err) {
      next(err);
    }
  },
];

exports.updateStory = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('storyId').isUUID().withMessage('无效的Story ID'),
  body('title').optional().notEmpty().withMessage('Story标题不能为空'),
  body('description').optional(),
  body('storyPoints').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['backlog', 'todo', 'in_progress', 'done']),
  body('priority').optional().isIn(['urgent', 'high', 'medium', 'low']),
  body('acceptanceCriteria').optional(),
  body('assigneeId').optional({ checkFalsy: true }).isUUID(),
  body('sprintId').optional({ checkFalsy: true }).isUUID(),
  body('order').optional().isInt(),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const story = await Story.findOne({
        where: { id: req.params.storyId, projectId: req.params.projectId },
      });
      if (!story) throw new AppError('Story不存在', 404);
      
      const { title, description, storyPoints, status, priority, acceptanceCriteria, assigneeId, sprintId, order } = req.body;
      if (title !== undefined) story.title = title;
      if (description !== undefined) story.description = description;
      if (storyPoints !== undefined) story.storyPoints = storyPoints;
      if (status !== undefined) story.status = status;
      if (priority !== undefined) story.priority = priority;
      if (acceptanceCriteria !== undefined) story.acceptanceCriteria = acceptanceCriteria;
      if (assigneeId !== undefined) story.assigneeId = assigneeId || null;
      if (sprintId !== undefined) story.sprintId = sprintId || null;
      if (order !== undefined) story.order = order;
      
      await story.save();
      
      const result = await Story.findByPk(story.id, {
        include: [
          { model: User, as: 'assignee', attributes: ['id', 'nickname', 'avatar'] },
          { model: User, as: 'creator', attributes: ['id', 'nickname'] },
          { model: Epic, as: 'epic', attributes: ['id', 'name', 'color'] },
          { model: Sprint, as: 'sprint', attributes: ['id', 'name', 'status'] },
        ],
      });
      
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
];

exports.deleteStory = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('storyId').isUUID().withMessage('无效的Story ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const story = await Story.findOne({
        where: { id: req.params.storyId, projectId: req.params.projectId },
      });
      if (!story) throw new AppError('Story不存在', 404);
      
      await Task.update({ storyId: null }, { where: { storyId: story.id } });
      await story.destroy();
      
      res.json({ message: 'Story已删除' });
    } catch (err) {
      next(err);
    }
  },
];

exports.batchUpdateStoryOrder = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  body('stories').isArray().withMessage('stories必须是数组'),
  body('stories.*.id').isUUID().withMessage('无效的Story ID'),
  body('stories.*.order').isInt().withMessage('order必须是整数'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      const { stories } = req.body;
      for (const s of stories) {
        await Story.update(
          { order: s.order },
          { where: { id: s.id, projectId: req.params.projectId } }
        );
      }
      res.json({ message: '排序已更新' });
    } catch (err) {
      next(err);
    }
  },
];
