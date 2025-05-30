const express = require('express');
const searchController = require('../../controller/search');
const router = express.Router();

router.get('/results', searchController.search);

module.exports = router;