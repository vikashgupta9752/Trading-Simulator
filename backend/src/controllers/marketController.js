const SimulationService = require('../engine/SimulationService');
const CandleStickService = require('../engine/CandleStickService');
const StrategyEngine = require('../engine/StrategyEngine');

const getMarketStatus = (req, res) => {
    try {
        const basePrices = SimulationService.basePrices;
        const previousCloses = SimulationService.previousCloses || {};

        const marketData = Object.keys(basePrices).map(ticker => {
            const price = basePrices[ticker];
            const prevClose = previousCloses[ticker] || price;
            const change = (price - prevClose).toFixed(2);
            const pct = prevClose ? ((change / prevClose) * 100).toFixed(2) : '0.00';

            return {
                ticker,
                name: SimulationService.stockNames[ticker] || ticker,
                price: Number(price),
                change: Number(change),
                pct: Number(pct)
            };
        });
        res.json(marketData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCandleData = (req, res) => {
    try {
        const { ticker, interval } = req.params;
        const candles = CandleStickService.getCandles(ticker, interval);
        res.json(candles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const searchTicker = async (req, res) => {
    const { ticker } = req.params;
    if (!ticker) return res.status(400).json({ message: 'Ticker required' });

    try {
        const resolvedTicker = await SimulationService.discoverTicker(ticker.toUpperCase());
        if (resolvedTicker) {
            res.json({
                ticker: resolvedTicker,
                name: SimulationService.stockNames[resolvedTicker] || resolvedTicker
            });
        } else {
            res.status(404).json({ message: 'Ticker not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Search failed' });
    }
};

const getStrategySignal = async (req, res) => {
    try {
        const { ticker } = req.params;
        const signal = StrategyEngine.getSignal(ticker);
        res.json(signal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMarketStatus,
    getCandleData,
    searchTicker,
    getStrategySignal
};
