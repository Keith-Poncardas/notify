const express = require('express');
const authController = require('../../controller/auth/index');
const validateSchema = require("../../middleware/validateSchema");
const { signUpSchema, loginSchema } = require("../../utils/schemas");
const router = express.Router();

router.post('/new', validateSchema(signUpSchema), authController.signup);
router.post('/login', validateSchema(loginSchema), authController.login);
router.post('/logout', authController.logout);

module.exports = router;