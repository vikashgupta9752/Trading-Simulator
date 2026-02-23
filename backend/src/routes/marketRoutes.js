const express = require('express');
const router = express.Router();
const { getMarketStatus, getCandleData, searchTicker, getStrategySignal } = require('../controllers/marketController');
const { protect } = require('../middleware/authMiddleware');

router.get('/status', protect, getMarketStatus);
router.get('/candles/:ticker/:interval', protect, getCandleData);
router.get('/search/:ticker', protect, searchTicker);
router.get('/strategy/:ticker', protect, getStrategySignal);

module.exports = router;
