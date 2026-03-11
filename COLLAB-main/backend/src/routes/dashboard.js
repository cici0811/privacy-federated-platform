const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticateToken = require('../middleware/auth');

router.get('/stats', authenticateToken, dashboardController.getStats);
router.get('/audit-logs', authenticateToken, dashboardController.getAuditLogs);

module.exports = router;
