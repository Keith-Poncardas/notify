const express = require('express');
const { homepage, seePost, viewProfile, viewUsers, likeCounts } = require('../controller/public');
const validateObjectId = require('../middleware/validateObjectId');
const router = express.Router();

router.get('/', homepage);
router.get('/:id/view', validateObjectId('id'), seePost);
router.get('/:id/profile', validateObjectId('id'), viewProfile);
router.get('/users', viewUsers);
router.get('/like-count', likeCounts);

module.exports = router;