const StrategyEngine = require('./StrategyEngine');

async function verifyStrategies() {
    console.log("--- Starting AI Strategy Verification ---");

    // Sample data: Upward trend
    const uptrend = [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120];

    // 1. SMA Test
    const sma5 = StrategyEngine.calculateSMA(uptrend, 5);
    console.log("SMA 5 (Expected 118):", sma5);

    // 2. EMA Test
    const ema12 = StrategyEngine.calculateEMA(uptrend, 12);
    console.log("EMA 12 (Positive Growth):", ema12 > 100);

    // 3. RSI Test
    const rsi = StrategyEngine.calculateRSI(uptrend);
    console.log("RSI for Uptrend (Expected > 70):", rsi);

    // 4. ML Prediction Test
    const predicted = StrategyEngine.predictPrice(uptrend);
    console.log("Predicted Next Price (Expected ~121):", predicted);

    // 5. Signal Test (Mocking CandleService data might be complex, so we test internal logic)
    // We can manually call calculations and score them
    const maSignal = StrategyEngine.calculateSMA(uptrend, 5) > StrategyEngine.calculateSMA(uptrend, 20) ? 1 : -1;
    console.log("MA Signal (Expected 1/Buy):", maSignal);

    console.log("--- AI Strategy Verification Completed ---");
}

if (require.main === module) {
    verifyStrategies().catch(console.error);
}

module.exports = verifyStrategies;
