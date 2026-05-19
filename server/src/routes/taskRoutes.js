const router = require('express').Router();
const taskCtrl = require('../controllers/taskController');
const auth = require('../middlewares/auth');

router.post('/:projectId/tasks', auth, taskCtrl.createTask);
router.get('/:projectId/tasks', auth, taskCtrl.getProjectTasks);
router.get('/:projectId/tasks/:taskId', auth, taskCtrl.getTask);
router.put('/:projectId/tasks/:taskId', auth, taskCtrl.updateTask);
router.delete('/:projectId/tasks/:taskId', auth, taskCtrl.deleteTask);
router.put('/:projectId/tasks/batch/order', auth, taskCtrl.batchUpdateOrder);
router.post('/:projectId/tasks/:taskId/comments', auth, taskCtrl.createComment);
router.get('/:projectId/tasks/:taskId/comments', auth, taskCtrl.getComments);
router.delete('/:projectId/tasks/:taskId/comments/:commentId', auth, taskCtrl.deleteComment);

module.exports = router;
