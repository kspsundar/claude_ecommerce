const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/api/cartController');
const { authenticate } = require('../../middleware/apiAuth');

router.use(authenticate);
router.get('/', cartController.get);
router.post('/', cartController.add);
router.put('/:id', cartController.update);
router.delete('/:id', cartController.remove);

module.exports = router;
