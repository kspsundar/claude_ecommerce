const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/api/categoryController');

router.get('/', categoryController.list);

module.exports = router;
