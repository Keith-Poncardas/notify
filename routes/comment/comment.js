const express = require('express');
const validateObjectId = require('../../middleware/validateObjectId');
const commentController = require('../../controller/comment');
const router = express.Router();

router.post('/:id/new', validateObjectId('id'), commentController.createComment);
router.delete('/:id/delete', validateObjectId('id'), commentController.deleteComment);
router.put('/:id/edit', validateObjectId('id'), commentController.editComment);

module.exports = router;