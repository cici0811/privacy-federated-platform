const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /api/recommendations:
 *   get:
 *     summary: Get personalized federated recommendations
 *     tags: [Recommendation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recommendations
 */
router.get('/', auth, recommendationController.getRecommendations);

module.exports = router;
