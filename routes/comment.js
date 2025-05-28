const express = require('express');
const validateObjectId = require('../middleware/validateObjectId');
const { createNewComment, killComment, alterComment } = require('../controller/private');
const router = express.Router();

router.post('/:id/new', validateObjectId('id'), createNewComment);
router.delete('/:id/delete', validateObjectId('id'), killComment);
router.put('/:id/edit', validateObjectId('id'), alterComment);

module.exports = router;