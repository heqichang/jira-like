const router = require('express').Router();
const timeLogCtrl = require('../controllers/timeLogController');
const auth = require('../middlewares/auth');

router.get('/timelogs/me', auth, timeLogCtrl.getMyTimeLogs);
router.post('/:projectId/tasks/:taskId/timelogs', auth, timeLogCtrl.createTimeLog);
router.get('/:projectId/tasks/:taskId/timelogs', auth, timeLogCtrl.getTaskTimeLogs);
router.put('/:projectId/tasks/:taskId/timelogs/:timeLogId', auth, timeLogCtrl.updateTimeLog);
router.delete('/:projectId/tasks/:taskId/timelogs/:timeLogId', auth, timeLogCtrl.deleteTimeLog);
router.get('/:projectId/timelogs', auth, timeLogCtrl.getProjectTimeLogs);
router.get('/:projectId/timelogs/reports', auth, timeLogCtrl.getTimeReports);

module.exports = router;
