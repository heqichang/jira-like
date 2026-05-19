const { body, param } = require('express-validator');
const { Task, TaskDependency, ProjectMember, User, Sprint, Epic } = require('../models/associations');
const { AppError } = require('../utils/errors');
const validate = require('../middlewares/validate');

const checkProjectMember = async (projectId, userId) => {
  const member = await ProjectMember.findOne({ where: { projectId, userId } });
  if (!member) throw new AppError('无权访问该项目', 403);
  return member;
};

const detectCycle = async (taskId, dependsOnTaskId, projectId) => {
  const visited = new Set();
  const stack = [dependsOnTaskId];
  
  while (stack.length > 0) {
    const currentId = stack.pop();
    if (currentId === taskId) return true;
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    
    const dependencies = await TaskDependency.findAll({
      where: { taskId: currentId },
    });
    
    for (const dep of dependencies) {
      if (!visited.has(dep.dependsOnTaskId)) {
        stack.push(dep.dependsOnTaskId);
      }
    }
  }
  
  return false;
};

exports.getGanttData = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      
      const tasks = await Task.findAll({
        where: { projectId: req.params.projectId, parentId: null },
        include: [
          { model: User, as: 'assignee', attributes: ['id', 'nickname', 'avatar'] },
          { model: Sprint, as: 'sprint', attributes: ['id', 'name'] },
          { model: Epic, as: 'epic', attributes: ['id', 'name', 'color'] },
          { model: Task, as: 'subtasks', include: [
            { model: User, as: 'assignee', attributes: ['id', 'nickname', 'avatar'] },
          ]},
        ],
        order: [['startDate', 'ASC'], ['dueDate', 'ASC']],
      });
      
      const dependencies = await TaskDependency.findAll({
        include: [
          { model: Task, as: 'task', where: { projectId: req.params.projectId }, attributes: ['id'] },
          { model: Task, as: 'dependsOnTask', attributes: ['id', 'title'] },
        ],
      });
      
      const milestones = tasks.filter(t => t.isMilestone);
      
      const taskIds = new Set(tasks.map(t => t.id));
      tasks.forEach(t => t.subtasks?.forEach(st => taskIds.add(st.id)));
      
      const validDependencies = dependencies.filter(dep => 
        taskIds.has(dep.taskId) && taskIds.has(dep.dependsOnTaskId)
      );
      
      const criticalPath = await calculateCriticalPath(tasks, validDependencies);
      
      res.json({
        tasks,
        dependencies: validDependencies,
        milestones,
        criticalPath,
      });
    } catch (err) {
      next(err);
    }
  },
];

const calculateCriticalPath = async (tasks, dependencies) => {
  const taskMap = new Map();
  const allTasks = [];
  
  for (const task of tasks) {
    allTasks.push(task);
    if (task.subtasks) {
      allTasks.push(...task.subtasks);
    }
  }
  
  for (const task of allTasks) {
    taskMap.set(task.id, {
      ...task.toJSON(),
      earliestStart: 0,
      earliestFinish: 0,
      latestStart: Infinity,
      latestFinish: Infinity,
      dependencies: [],
      dependents: [],
    });
  }
  
  for (const dep of dependencies) {
    const task = taskMap.get(dep.taskId);
    const dependsOn = taskMap.get(dep.dependsOnTaskId);
    if (task && dependsOn) {
      task.dependencies.push(dep.dependsOnTaskId);
      dependsOn.dependents.push(dep.taskId);
    }
  }
  
  const sorted = [];
  const visited = new Set();
  
  const visit = (taskId) => {
    if (visited.has(taskId)) return;
    visited.add(taskId);
    const task = taskMap.get(taskId);
    if (task) {
      for (const depId of task.dependencies) {
        visit(depId);
      }
      sorted.push(taskId);
    }
  };
  
  for (const taskId of taskMap.keys()) {
    visit(taskId);
  }
  
  for (const taskId of sorted) {
    const task = taskMap.get(taskId);
    const duration = task.estimatedHours || 1;
    
    if (task.dependencies.length === 0) {
      task.earliestStart = 0;
    } else {
      task.earliestStart = Math.max(
        ...task.dependencies.map(depId => taskMap.get(depId)?.earliestFinish || 0)
      );
    }
    task.earliestFinish = task.earliestStart + duration;
  }
  
  const maxFinish = Math.max(...Array.from(taskMap.values()).map(t => t.earliestFinish));
  
  for (let i = sorted.length - 1; i >= 0; i--) {
    const taskId = sorted[i];
    const task = taskMap.get(taskId);
    const duration = task.estimatedHours || 1;
    
    if (task.dependents.length === 0) {
      task.latestFinish = maxFinish;
    } else {
      task.latestFinish = Math.min(
        ...task.dependents.map(depId => taskMap.get(depId)?.latestStart || maxFinish)
      );
    }
    task.latestStart = task.latestFinish - duration;
  }
  
  const criticalPath = [];
  for (const task of taskMap.values()) {
    if (Math.abs(task.earliestStart - task.latestStart) < 0.01) {
      criticalPath.push(task.id);
    }
  }
  
  return criticalPath;
};

exports.createDependency = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('taskId').isUUID().withMessage('无效的任务ID'),
  body('dependsOnTaskId').isUUID().withMessage('无效的前置任务ID'),
  body('type').optional().isIn(['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish']),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      
      const { taskId, dependsOnTaskId } = req.params;
      if (taskId === dependsOnTaskId) {
        throw new AppError('任务不能依赖自己', 400);
      }
      
      const task = await Task.findOne({
        where: { id: taskId, projectId: req.params.projectId },
      });
      if (!task) throw new AppError('任务不存在', 404);
      
      const dependsOnTask = await Task.findOne({
        where: { id: dependsOnTaskId, projectId: req.params.projectId },
      });
      if (!dependsOnTask) throw new AppError('前置任务不存在', 404);
      
      const hasCycle = await detectCycle(taskId, dependsOnTaskId, req.params.projectId);
      if (hasCycle) throw new AppError('依赖关系会形成循环', 400);
      
      const existing = await TaskDependency.findOne({
        where: { taskId, dependsOnTaskId },
      });
      if (existing) throw new AppError('依赖关系已存在', 409);
      
      const dependency = await TaskDependency.create({
        taskId,
        dependsOnTaskId,
        type: req.body.type || 'finish_to_start',
      });
      
      res.status(201).json(dependency);
    } catch (err) {
      next(err);
    }
  },
];

exports.deleteDependency = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('dependencyId').isUUID().withMessage('无效的依赖ID'),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      
      const dependency = await TaskDependency.findByPk(req.params.dependencyId, {
        include: [{ model: Task, as: 'task', where: { projectId: req.params.projectId } }],
      });
      
      if (!dependency) throw new AppError('依赖关系不存在', 404);
      
      await dependency.destroy();
      res.json({ message: '依赖关系已删除' });
    } catch (err) {
      next(err);
    }
  },
];

exports.updateTaskDates = [
  param('projectId').isUUID().withMessage('无效的项目ID'),
  param('taskId').isUUID().withMessage('无效的任务ID'),
  body('startDate').optional().isISO8601(),
  body('dueDate').optional().isISO8601(),
  body('estimatedHours').optional().isFloat({ min: 0 }),
  validate,
  async (req, res, next) => {
    try {
      await checkProjectMember(req.params.projectId, req.user.id);
      
      const task = await Task.findOne({
        where: { id: req.params.taskId, projectId: req.params.projectId },
      });
      if (!task) throw new AppError('任务不存在', 404);
      
      const { startDate, dueDate, estimatedHours } = req.body;
      if (startDate !== undefined) task.startDate = startDate;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
      
      await task.save();
      res.json(task);
    } catch (err) {
      next(err);
    }
  },
];

exports.getTaskDependencies = [
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
      
      const dependencies = await TaskDependency.findAll({
        where: { taskId: req.params.taskId },
        include: [
          { model: Task, as: 'dependsOnTask', attributes: ['id', 'title', 'status'] },
        ],
      });
      
      const dependents = await TaskDependency.findAll({
        where: { dependsOnTaskId: req.params.taskId },
        include: [
          { model: Task, as: 'task', attributes: ['id', 'title', 'status'] },
        ],
      });
      
      res.json({
        dependencies,
        dependents: dependents.map(d => ({
          id: d.id,
          task: d.task,
          type: d.type,
        })),
      });
    } catch (err) {
      next(err);
    }
  },
];
