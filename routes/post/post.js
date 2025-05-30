const express = require('express');
const upload = require("../../config/multer");
const postController = require('../../controller/post');
const requireAuth = require("../../middleware/authenticateRoute");
const validateObjectId = require("../../middleware/validateObjectId");
const router = express.Router();

router.post('/create', requireAuth, upload.single('postImage'), postController.createPost);
router.put('/:id/edit', requireAuth, validateObjectId('id'), upload.single('postImage'), postController.editPost);
router.delete('/:id/delete', validateObjectId('id'), requireAuth, postController.deletePost);
router.get('/:id/view', validateObjectId('id'), postController.viewPost);

module.exports = router;