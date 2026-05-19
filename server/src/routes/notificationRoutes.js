const router = require('express').Router();
const notificationCtrl = require('../controllers/notificationController');
const auth = require('../middlewares/auth');

router.get('/notifications', auth, notificationCtrl.getMyNotifications);
router.get('/notifications/unread-count', auth, notificationCtrl.getUnreadCount);
router.put('/notifications/:notificationId/read', auth, notificationCtrl.markAsRead);
router.put('/notifications/read-all', auth, notificationCtrl.markAllAsRead);
router.delete('/notifications/:notificationId', auth, notificationCtrl.deleteNotification);
router.get('/notifications/settings', auth, notificationCtrl.getNotificationSettings);
router.put('/notifications/settings', auth, notificationCtrl.updateNotificationSettings);

module.exports = router;
