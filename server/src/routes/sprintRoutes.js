const router = require('express').Router();
const sprintCtrl = require('../controllers/sprintController');
const auth = require('../middlewares/auth');

router.post('/:projectId/sprints', auth, sprintCtrl.createSprint);
router.get('/:projectId/sprints', auth, sprintCtrl.getProjectSprints);
router.get('/:projectId/sprints/velocity', auth, sprintCtrl.getVelocityStats);
router.get('/:projectId/sprints/:sprintId', auth, sprintCtrl.getSprint);
router.put('/:projectId/sprints/:sprintId', auth, sprintCtrl.updateSprint);
router.delete('/:projectId/sprints/:sprintId', auth, sprintCtrl.deleteSprint);
router.post('/:projectId/sprints/:sprintId/tasks', auth, sprintCtrl.addTaskToSprint);
router.delete('/:projectId/sprints/:sprintId/tasks/:taskId', auth, sprintCtrl.removeTaskFromSprint);
router.post('/:projectId/sprints/:sprintId/stories', auth, sprintCtrl.addStoryToSprint);
router.delete('/:projectId/sprints/:sprintId/stories/:storyId', auth, sprintCtrl.removeStoryFromSprint);
router.post('/:projectId/sprints/:sprintId/burndown', auth, sprintCtrl.recordBurndown);

module.exports = router;
