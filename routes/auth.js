const express = require('express');
const { createNewUser, loginUserSession, logoutUser } = require("../controller/auth");
const validateSchema = require("../middleware/validateSchema");
const { signUpSchema, loginSchema } = require("../utils/schemas");
const router = express.Router();

router.post('/new', validateSchema(signUpSchema), createNewUser);
router.post('/login', validateSchema(loginSchema), loginUserSession);
router.post('/logout', logoutUser);

module.exports = router;