const router = require('express').Router();
const tagCtrl = require('../controllers/tagController');
const auth = require('../middlewares/auth');

router.post('/:projectId/tags', auth, tagCtrl.createTag);
router.get('/:projectId/tags', auth, tagCtrl.getProjectTags);
router.put('/:projectId/tags/:tagId', auth, tagCtrl.updateTag);
router.delete('/:projectId/tags/:tagId', auth, tagCtrl.deleteTag);
router.post('/:projectId/tasks/:taskId/tags', auth, tagCtrl.addTagToTask);
router.delete('/:projectId/tasks/:taskId/tags/:tagId', auth, tagCtrl.removeTagFromTask);
router.get('/:projectId/tasks/:taskId/tags', auth, tagCtrl.getTaskTags);

module.exports = router;
