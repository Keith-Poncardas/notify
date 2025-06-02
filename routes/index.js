const express = require('express');
const postController = require('../controller/post');
const requireAuth = require('../middleware/authenticateRoute');
const router = express.Router();

router.use('/auth', require('./auth/auth'));
router.use('/users', require('./user/user'));
router.use('/posts', require('./post/post'));
router.use('/likes', requireAuth, require('./post/like'));
router.use('/comments', requireAuth, require('./comment/comment'));
router.use('/', require('./search/results'));
router.use('/', require('./user/profile'));
router.use('/', require('./post/post'));

module.exports = router;