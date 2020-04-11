const router = require('express').Router();
const {getTags} = require('../controllers/tag.controller');

// return a list of tags
router.get('/', getTags);

module.exports = router;