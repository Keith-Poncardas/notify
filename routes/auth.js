const express = require('express');
const { createNewUser, loginUserSession, logoutUser } = require('../controller/auth');
const router = express.Router();

router.post('/create-user', createNewUser);
router.post('/login-user', loginUserSession);
router.post('/logout', logoutUser);

module.exports = router;