const router = require('express').Router();
const ganttCtrl = require('../controllers/ganttController');
const auth = require('../middlewares/auth');

router.get('/:projectId/gantt', auth, ganttCtrl.getGanttData);
router.post('/:projectId/tasks/:taskId/dependencies', auth, ganttCtrl.createDependency);
router.delete('/:projectId/dependencies/:dependencyId', auth, ganttCtrl.deleteDependency);
router.get('/:projectId/tasks/:taskId/dependencies', auth, ganttCtrl.getTaskDependencies);
router.put('/:projectId/tasks/:taskId/dates', auth, ganttCtrl.updateTaskDates);

module.exports = router;
