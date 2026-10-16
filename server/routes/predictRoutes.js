const express = require('express');
const router = express.Router();
const { getPrediction, getHistory, generateReport, saveRecommendation, downloadReport, getHealthSummary, emailReport } = require('../controllers/predictController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, getPrediction);
router.post('/save', protect, saveRecommendation);
router.get('/history', protect, getHistory);
router.post('/report', protect, generateReport);
router.post('/download-report', protect, downloadReport);
router.post('/email-report', protect, emailReport);
router.post('/health-summary', protect, getHealthSummary);

module.exports = router;
