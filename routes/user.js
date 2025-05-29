const express = require('express');
const { viewUsers } = require('../controller/public');
const router = express.Router();

router.get(['/page/:pageNumber', '/'], viewUsers);

module.exports = router;