const express = require('express');
const { viewProfile } = require('../controller/public');
const { editProfile, editProfilePage } = require('../controller/private');
const requireAuth = require('../middleware/authenticateRoute');
const upload = require('../config/multer');
const validateSchema = require('../middleware/validateSchema');
const { editProfileSchema } = require('../utils/schemas');
const { deleteProfile } = require('../controller/auth');
const router = express.Router();

router.get('/:username', viewProfile);
router.get('/:username/edit', requireAuth, editProfilePage);
router.delete('/:username/delete', requireAuth, deleteProfile);
router.put('/:username/edit', requireAuth, upload.single('profileImage'), validateSchema(editProfileSchema), editProfile);

module.exports = router;