const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const travelController = require('../controllers/travelController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /api/travel/search:
 *   post:
 *     summary: Initiate a privacy-preserving travel search
 *     tags: [Travel]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [destination, dateRange]
 *             properties:
 *               destination:
 *                 type: string
 *               dateRange:
 *                 type: string
 *               companions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Search initiated
 */
router.post('/search', [
  auth,
  body('destination').notEmpty().trim().escape(),
  body('dateRange').notEmpty(),
  body('companions').isArray()
], travelController.searchTravel);

/**
 * @swagger
 * /api/travel/results/{id}:
 *   get:
 *     summary: Get travel search results
 *     tags: [Travel]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of travel options
 */
router.get('/results/:id', auth, travelController.getTravelResults);

/**
 * @swagger
 * /api/travel/book:
 *   post:
 *     summary: Book a travel option anonymously
 *     tags: [Travel]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [searchId, optionId]
 *             properties:
 *               searchId:
 *                 type: string
 *               optionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking confirmation
 */
router.post('/book', [
  auth,
  body('searchId').notEmpty(),
  body('optionId').notEmpty()
], travelController.bookTravel);

module.exports = router;
