const express = require('express');
const router = express.Router();
const networkController = require('../controllers/networkController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, networkController.getNodes);
router.get('/:id', authenticateToken, networkController.getNodeDetails);

module.exports = router;
