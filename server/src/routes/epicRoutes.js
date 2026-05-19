const router = require('express').Router();
const epicCtrl = require('../controllers/epicController');
const auth = require('../middlewares/auth');

router.post('/:projectId/epics', auth, epicCtrl.createEpic);
router.get('/:projectId/epics', auth, epicCtrl.getProjectEpics);
router.get('/:projectId/epics/:epicId', auth, epicCtrl.getEpic);
router.put('/:projectId/epics/:epicId', auth, epicCtrl.updateEpic);
router.delete('/:projectId/epics/:epicId', auth, epicCtrl.deleteEpic);
router.post('/:projectId/epics/:epicId/stories', auth, epicCtrl.createStory);
router.get('/:projectId/stories', auth, epicCtrl.getProjectStories);
router.get('/:projectId/stories/:storyId', auth, epicCtrl.getStory);
router.put('/:projectId/stories/:storyId', auth, epicCtrl.updateStory);
router.delete('/:projectId/stories/:storyId', auth, epicCtrl.deleteStory);
router.put('/:projectId/stories/batch/order', auth, epicCtrl.batchUpdateStoryOrder);

module.exports = router;
