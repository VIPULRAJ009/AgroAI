const express = require('express');
const router = express.Router();
const { sendFeedback } = require('../controllers/feedbackController');

router.post('/', sendFeedback);

module.exports = router;
