const express = require('express');
const router = express.Router();
const { getMarketRates } = require('../controllers/marketController');

router.get('/', getMarketRates);

module.exports = router;
