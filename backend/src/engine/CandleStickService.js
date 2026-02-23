const Trade = require('../models/Trade');

class CandleStickService {
    constructor() {
        this.candles = {}; // ticker -> interval -> timestamp -> candle
        this.intervals = ['1m', '5m', '15m', '1h'];
        this.io = null;
    }

    setIo(io) {
        this.io = io;
    }

    // Process a new trade and update current candles
    updateCandle(trade) {
        const { ticker, price, createdAt } = trade;
        const timestamp = new Date(createdAt).getTime();

        this.intervals.forEach(interval => {
            const candleTime = this.getCandleTime(timestamp, interval);

            if (!this.candles[ticker]) this.candles[ticker] = {};
            if (!this.candles[ticker][interval]) this.candles[ticker][interval] = {};

            let candle = this.candles[ticker][interval][candleTime];

            if (!candle) {
                // New candle
                candle = {
                    time: candleTime,
                    open: price,
                    high: price,
                    low: price,
                    close: price,
                    volume: trade.quantity
                };
            } else {
                // Update existing candle
                candle.high = Math.max(candle.high, price);
                candle.low = Math.min(candle.low, price);
                candle.close = price;
                candle.volume += trade.quantity;
            }

            this.candles[ticker][interval][candleTime] = candle;

            // Emit update
            if (this.io) {
                this.io.emit('candleUpdate', { ticker, interval, candle });
            }
        });
    }

    seedInitialCandles(ticker, price) {
        if (this.candles[ticker]) return; // Already has data

        const now = Date.now();
        this.intervals.forEach(interval => {
            if (!this.candles[ticker]) this.candles[ticker] = {};
            if (!this.candles[ticker][interval]) this.candles[ticker][interval] = {};

            // Generate 50 historical candles
            let lastPrice = price;
            for (let i = 50; i >= 0; i--) {
                const candleTime = this.getCandleTime(now - (i * this.getIntervalMs(interval)), interval);

                // Add some randomness but trend towards current price
                const change = 1 + (Math.random() * 0.01 - 0.005);
                const open = lastPrice;
                const close = lastPrice * change;
                const high = Math.max(open, close) * (1 + Math.random() * 0.002);
                const low = Math.min(open, close) * (1 - Math.random() * 0.002);

                this.candles[ticker][interval][candleTime] = {
                    time: candleTime,
                    open: parseFloat(open.toFixed(2)),
                    high: parseFloat(high.toFixed(2)),
                    low: parseFloat(low.toFixed(2)),
                    close: parseFloat(close.toFixed(2)),
                    volume: Math.floor(Math.random() * 500) + 100
                };
                lastPrice = close;
            }
        });
    }

    getIntervalMs(interval) {
        switch (interval) {
            case '1m': return 60 * 1000;
            case '5m': return 5 * 60 * 1000;
            case '15m': return 15 * 60 * 1000;
            case '1h': return 60 * 60 * 1000;
            default: return 60 * 1000;
        }
    }

    getCandleTime(timestamp, interval) {
        const date = new Date(timestamp);
        switch (interval) {
            case '1m':
                date.setSeconds(0, 0);
                break;
            case '5m':
                date.setMinutes(Math.floor(date.getMinutes() / 5) * 5, 0, 0);
                break;
            case '15m':
                date.setMinutes(Math.floor(date.getMinutes() / 15) * 15, 0, 0);
                break;
            case '1h':
                date.setMinutes(0, 0, 0);
                break;
            default: // 1m default
                date.setSeconds(0, 0);
        }
        return date.getTime();
    }

    getCandles(ticker, interval) {
        if (!this.candles[ticker] || !this.candles[ticker][interval]) return [];
        return Object.values(this.candles[ticker][interval]).sort((a, b) => a.time - b.time);
    }
}

module.exports = new CandleStickService();
