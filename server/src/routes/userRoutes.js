const router = require('express').Router();
const userCtrl = require('../controllers/userController');
const auth = require('../middlewares/auth');

router.post('/register', userCtrl.register);
router.post('/login', userCtrl.login);
router.get('/profile', auth, userCtrl.getProfile);
router.put('/profile', auth, userCtrl.updateProfile);
router.put('/password', auth, userCtrl.changePassword);

module.exports = router;
