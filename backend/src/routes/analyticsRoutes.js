const express = require('express');
const router = express.Router();
const { getCandles } = require('../controllers/analyticsController');

router.get('/candles/:ticker', getCandles);

module.exports = router;
