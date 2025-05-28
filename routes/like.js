const express = require('express');
const { likeAndUnlikeToggle } = require('../controller/private');
const router = express.Router();

router.post('/toggle', likeAndUnlikeToggle);

module.exports = router;