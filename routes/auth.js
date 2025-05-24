const express = require('express');
const { createNewUser, loginUserSession, logoutUser } = require('../controller/auth');
const validateSchema = require('../middleware/validateSchema');
const { signUpSchema, loginSchema } = require('../utils/schemas');
const router = express.Router();

router.post('/create-user', validateSchema(signUpSchema), createNewUser);
router.post('/login-user', validateSchema(loginSchema), loginUserSession);
router.post('/logout', logoutUser);

module.exports = router;