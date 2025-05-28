const express = require('express');
const { getSearchResults } = require('../controller/private');
const router = express.Router();

router.get('/results', getSearchResults);

module.exports = router;