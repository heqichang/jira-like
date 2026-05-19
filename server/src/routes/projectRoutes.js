const router = require('express').Router();
const projectCtrl = require('../controllers/projectController');
const auth = require('../middlewares/auth');

router.post('/', auth, projectCtrl.createProject);
router.get('/', auth, projectCtrl.getMyProjects);
router.get('/archived', auth, projectCtrl.getArchivedProjects);
router.get('/:id', auth, projectCtrl.getProject);
router.put('/:id', auth, projectCtrl.updateProject);
router.put('/:id/archive', auth, projectCtrl.archiveProject);
router.put('/:id/unarchive', auth, projectCtrl.unarchiveProject);
router.delete('/:id', auth, projectCtrl.deleteProject);
router.post('/:id/members', auth, projectCtrl.addMember);
router.delete('/:id/members/:userId', auth, projectCtrl.removeMember);

module.exports = router;
