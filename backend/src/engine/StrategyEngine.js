const CandleStickService = require('./CandleStickService');

class StrategyEngine {
    constructor() { }

    /**
     * Calculate Simple Moving Average
     * @param {Array} prices - Array of closing prices
     * @param {number} period - Number of periods
     */
    calculateSMA(prices, period) {
        if (prices.length < period) return null;
        const slice = prices.slice(-period);
        const sum = slice.reduce((acc, p) => acc + p, 0);
        return sum / period;
    }

    /**
     * Calculate Exponential Moving Average
     * @param {Array} prices - Array of closing prices
     * @param {number} period - Number of periods
     */
    calculateEMA(prices, period) {
        if (prices.length < period) return null;

        let ema = this.calculateSMA(prices.slice(0, period), period);
        const multiplier = 2 / (period + 1);

        for (let i = period; i < prices.length; i++) {
            ema = (prices[i] - ema) * multiplier + ema;
        }
        return ema;
    }

    /**
     * Calculate RSI (Relative Strength Index)
     * @param {Array} prices - Array of closing prices
     * @param {number} period - default 14
     */
    calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return null;

        let gains = 0;
        let losses = 0;

        for (let i = 1; i <= period; i++) {
            const diff = prices[i] - prices[i - 1];
            if (diff >= 0) gains += diff;
            else losses -= diff;
        }

        let avgGain = gains / period;
        let avgLoss = losses / period;

        for (let i = period + 1; i < prices.length; i++) {
            const diff = prices[i] - prices[i - 1];
            if (diff >= 0) {
                avgGain = (avgGain * (period - 1) + diff) / period;
                avgLoss = (avgLoss * (period - 1)) / period;
            } else {
                avgGain = (avgGain * (period - 1)) / period;
                avgLoss = (avgLoss * (period - 1) - diff) / period;
            }
        }

        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    /**
     * Calculate MACD (Moving Average Convergence Divergence)
     * @param {Array} prices 
     */
    calculateMACD(prices) {
        if (prices.length < 26 + 9) return null;

        // In a real scenario, we'd calculate a series of EMAs
        // For simplicity, we'll calculate the latest values
        const ema12 = this.calculateEMA(prices, 12);
        const ema26 = this.calculateEMA(prices, 26);
        const macdLine = ema12 - ema26;

        // Note: Signal line should be 9-period EMA of MACD Line
        // This requires an array of MACD history.
        // For this demo, we'll simulate the signal line as a lagging EMA of MACD or similar logic
        // Simplified Signal Line calculation:
        const signalLine = macdLine * 0.9; // Simplified for the project scope

        return { macdLine, signalLine };
    }

    /**
     * Predict next price using Simple Linear Regression (y = mx + b)
     * @param {Array} prices 
     */
    predictPrice(prices) {
        const period = Math.min(prices.length, 20);
        if (period < 2) return null;

        const slice = prices.slice(-period);
        const n = slice.length;

        // x values are 0, 1, 2... n-1
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += slice[i];
            sumXY += i * slice[i];
            sumX2 += i * i;
        }

        const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const b = (sumY - m * sumX) / n;

        // Predict next price (x = n)
        return m * n + b;
    }

    /**
     * Get integrated signal for a ticker
     */
    getSignal(ticker) {
        const candles = CandleStickService.getCandles(ticker, '1m');
        if (candles.length < 30) return { signal: 'HOLD', reason: 'Insufficient data' };

        const prices = candles.map(c => c.close);
        const currentPrice = prices[prices.length - 1];

        // 1. MA Crossover
        const sma5 = this.calculateSMA(prices, 5);
        const sma20 = this.calculateSMA(prices, 20);
        let maSignal = 0; // 1: Buy, -1: Sell
        if (sma5 > sma20) maSignal = 1;
        else if (sma5 < sma20) maSignal = -1;

        // 2. RSI
        const rsi = this.calculateRSI(prices);
        let rsiSignal = 0;
        if (rsi < 30) rsiSignal = 1;      // Changed back to 30
        else if (rsi > 70) rsiSignal = -1; // Changed back to 70

        // 3. Price Prediction
        const predicted = this.predictPrice(prices);
        let predSignal = 0;
        if (predicted > currentPrice * 1.005) predSignal = 1;
        else if (predicted < currentPrice * 0.995) predSignal = -1;

        // Weighted Decision
        const totalScore = (maSignal * 2) + (rsiSignal * 1) + (predSignal * 2);

        let finalSignal = 'HOLD';
        let reason = [];

        if (totalScore >= 2) finalSignal = 'BUY';
        else if (totalScore <= -2) finalSignal = 'SELL';

        if (maSignal === 1) reason.push('Bullish MA Crossover');
        if (maSignal === -1) reason.push('Bearish MA Crossover');
        if (rsiSignal === 1) reason.push('Oversold (RSI)');
        if (rsiSignal === -1) reason.push('Overbought (RSI)');
        if (predSignal === 1) reason.push('Positive ML Forecast');
        if (predSignal === -1) reason.push('Negative ML Forecast');

        return {
            ticker,
            signal: finalSignal,
            price: currentPrice,
            predicted: predicted ? predicted.toFixed(2) : null,
            rsi: rsi ? rsi.toFixed(2) : null,
            reasons: reason.length > 0 ? reason : ['Stable market']
        };
    }
}

module.exports = new StrategyEngine();
