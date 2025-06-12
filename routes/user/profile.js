const express = require('express');
const userController = require('../../controller/user');
const requireAuth = require('../../middleware/authenticateRoute');
const upload = require('../../config/multer');
const validateSchema = require('../../middleware/validateSchema');
const { editProfileSchema } = require('../../utils/schemas');
const router = express.Router();

router.get(['/:username/page/:pageNumber', '/:username'], userController.viewUser);
router.get('/:username/edit', requireAuth, userController.getEditUserPage);
router.delete('/:username/delete', requireAuth, userController.deleteUser);
router.put('/:username/edit', requireAuth, upload.single('profileImage'), validateSchema(editProfileSchema), userController.editUser);
router.get(['/:username/likes/page/:pageNumber', '/:username/likes'], userController.getUserLikes);

module.exports = router;