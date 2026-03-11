const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const schedulerController = require('../controllers/schedulerController');
const auth = require('../middleware/auth'); // Assuming auth middleware exists

/**
 * @swagger
 * /api/scheduler/initiate:
 *   post:
 *     summary: Initiate a federated meeting scheduling task
 *     tags: [Scheduler]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [topic, duration]
 *             properties:
 *               topic:
 *                 type: string
 *               duration:
 *                 type: string
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *               dateRange:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task initiated
 */
router.post('/initiate', [
  auth,
  body('topic').notEmpty().trim().escape(),
  body('duration').notEmpty(),
  body('participants').isArray()
], schedulerController.initiateMeeting);

/**
 * @swagger
 * /api/scheduler/status/{id}:
 *   get:
 *     summary: Get status of a scheduling task
 *     tags: [Scheduler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status and progress
 */
router.get('/status/:id', auth, schedulerController.getMeetingStatus);

/**
 * @swagger
 * /api/scheduler/candidates/{id}:
 *   get:
 *     summary: Get computed time slot candidates
 *     tags: [Scheduler]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of candidates
 */
router.get('/candidates/:id', auth, schedulerController.getCandidates);

/**
 * @swagger
 * /api/scheduler/confirm:
 *   post:
 *     summary: Confirm a meeting time slot
 *     tags: [Scheduler]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [meetingId, candidateId]
 *             properties:
 *               meetingId:
 *                 type: string
 *               candidateId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Meeting confirmed
 */
router.post('/confirm', [
  auth,
  body('meetingId').notEmpty(),
  body('candidateId').notEmpty()
], schedulerController.confirmMeeting);

module.exports = router;
