const Trade = require('../models/Trade');

// @desc    Get OHLC candles
// @route   GET /api/analytics/candles/:ticker
// @access  Public
const getCandles = async (req, res) => {
    const { ticker } = req.params;
    const { interval = 1 } = req.query; // Interval in minutes, default 1

    try {
        const trades = await Trade.find({ ticker }).sort({ createdAt: 1 });

        // Simple aggregation logic (in-memory for MVP, for production use MongoDB Aggregation Pipeline)
        const candles = [];
        let currentCandle = null;
        let candleStartTime = 0;

        trades.forEach(trade => {
            const tradeTime = new Date(trade.createdAt).getTime();
            const intervalMs = interval * 60 * 1000;
            const candleTime = Math.floor(tradeTime / intervalMs) * intervalMs;

            if (!currentCandle || candleTime > candleStartTime) {
                if (currentCandle) candles.push(currentCandle);

                candleStartTime = candleTime;
                currentCandle = {
                    time: new Date(candleTime).toISOString(),
                    open: trade.price,
                    high: trade.price,
                    low: trade.price,
                    close: trade.price,
                    volume: trade.quantity
                };
            } else {
                // Update current candle
                currentCandle.high = Math.max(currentCandle.high, trade.price);
                currentCandle.low = Math.min(currentCandle.low, trade.price);
                currentCandle.close = trade.price;
                currentCandle.volume += trade.quantity;
            }
        });

        if (currentCandle) candles.push(currentCandle);

        res.status(200).json(candles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching candles' });
    }
};

module.exports = {
    getCandles
};
