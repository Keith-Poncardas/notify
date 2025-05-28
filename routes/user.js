const express = require('express');
const { viewUsers } = require('../controller/public');
const router = express.Router();

router.get('/', viewUsers);

module.exports = router;