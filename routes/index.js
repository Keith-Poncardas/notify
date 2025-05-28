const express = require('express');
const { homepage } = require('../controller/public');
const requireAuth = require('../middleware/authenticateRoute');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/users', require('./user'));
router.use('/posts', require('./post'));
router.use('/likes', requireAuth, require('./like'));
router.use('/comments', requireAuth, require('./comment'));
router.use('/', require('./results'));
router.use('/', require('./profile'));
router.use('/', homepage);

module.exports = router;