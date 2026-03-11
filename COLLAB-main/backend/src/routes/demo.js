const express = require('express');
const router = express.Router();
const demoController = require('../controllers/demoController');

// These can be public or protected
router.post('/he/encrypt', demoController.encrypt);
router.post('/he/add', demoController.computeSum);
router.post('/he/decrypt', demoController.decrypt);

module.exports = router;
