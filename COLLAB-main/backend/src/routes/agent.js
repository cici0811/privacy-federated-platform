const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const authenticateToken = require('../middleware/auth');

router.get('/config', authenticateToken, agentController.getConfig);
router.post('/config', authenticateToken, agentController.updateConfig);

module.exports = router;
