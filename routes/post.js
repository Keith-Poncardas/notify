const express = require('express');
const upload = require("../config/multer");
const { alterPost, createNewPost, killPost } = require("../controller/private");
const { seePost } = require("../controller/public");
const requireAuth = require("../middleware/authenticateRoute");
const validateObjectId = require("../middleware/validateObjectId");
const router = express.Router();

router.post('/create', requireAuth, upload.single('postImage'), createNewPost);
router.put('/:id/edit', requireAuth, validateObjectId('id'), upload.single('postImage'), alterPost);
router.delete('/:id/delete', validateObjectId('id'), requireAuth, killPost);
router.get('/:id/view', validateObjectId('id'), seePost);

module.exports = router;