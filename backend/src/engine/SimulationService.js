const Order = require('../models/Order');
const User = require('../models/User');
const MatchingEngine = require('./MatchingEngine');

class SimulationService {
    constructor() {
        this.running = false;
        this.intervalId = null;
        this.basePrices = {
            'TCS': 3890, 'INFY': 1450, 'WIPRO': 450, 'RELIANCE': 2900, 'HDFCBANK': 1400,
            'BANKNIFTY': 46500, 'NIFTY50': 22000,
            'SENSEX': 72000, 'MIDCAP': 48000, 'IT': 36000, 'AUTO': 19000, 'FINNIFTY': 20500, 'PHARMA': 18500
        };
        this.stockNames = {
            'TCS': 'Tata Consultancy Services',
            'INFY': 'Infosys Limited',
            'WIPRO': 'Wipro Limited',
            'RELIANCE': 'Reliance Industries',
            'HDFCBANK': 'HDFC Bank Limited',
            'NIFTY50': 'Nifty 50 Index',
            'BANKNIFTY': 'Bank Nifty Index',
            'SENSEX': 'Sensex Index',
            'MIDCAP': 'Nifty Midcap 100',
            'IT': 'Nifty IT Index',
            'AUTO': 'Nifty Auto Index',
            'FINNIFTY': 'Nifty Financial Services',
            'PHARMA': 'Nifty Pharma Index'
        };
        this.volatility = 0.005; // 0.5% volatility
        this.botUserId = null;
        this.previousCloses = {}; // Store prev close for change calc
    }

    async initBotUser() {
        try {
            let bot = await User.findOne({ username: 'market_maker_bot' });
            if (!bot) {
                console.log("Creating Market Maker Bot...");
                bot = new User({
                    username: 'market_maker_bot',
                    password: 'bot_password_secure', // Placeholder
                    balance: 1000000000, // 1 Billion
                    portfolio: Object.keys(this.basePrices).map(ticker => ({ ticker, quantity: 1000000 }))
                });
                await bot.save();
            }
            this.botUserId = bot._id;
            console.log("Market Maker Bot Ready:", this.botUserId);

            // Update portfolio for existing bot if new tickers added
            const existingTickers = bot.portfolio.map(p => p.ticker);
            const allTickers = Object.keys(this.basePrices);
            let updated = false;
            for (const t of allTickers) {
                if (!existingTickers.includes(t)) {
                    bot.portfolio.push({ ticker: t, quantity: 1000000 });
                    updated = true;
                }
            }
            if (updated) await bot.save();

        } catch (err) {
            console.error("Failed to init bot user:", err);
        }
    }

    async start() {
        if (this.running) return;

        await this.initBotUser();
        if (!this.botUserId) {
            console.error("Cannot start simulation without bot user.");
            return;
        }

        this.running = true;
        console.log("Starting Market Simulation...");

        // Fetch real prices before starting loop
        await this.updateBasePrices();



        // Run every 3 seconds
        this.intervalId = setInterval(() => this.runSimulationStep(), 3000);

        // Seed initial candles for all initial tickers
        const CandleStickService = require('./CandleStickService');
        Object.keys(this.basePrices).forEach(ticker => {
            CandleStickService.seedInitialCandles(ticker, this.basePrices[ticker]);
        });

        // Refresh real prices every 1 minute
        setInterval(async () => {
            console.log("Refreshing real prices...");
            await this.updateBasePrices();
        }, 60 * 1000);

    }

    async updateBasePrices(extraTickers = []) {
        const YahooFinanceService = require('./YahooFinanceService');
        const tickers = [...new Set([...Object.keys(this.basePrices), ...extraTickers])];
        const realPrices = await YahooFinanceService.fetchInitialPrices(tickers);

        // Merge real prices
        Object.keys(realPrices).forEach(ticker => {
            if (realPrices[ticker]) {
                const { price, previousClose, name } = realPrices[ticker];
                this.basePrices[ticker] = price;
                // Store previous close for percentage calculations
                this.previousCloses[ticker] = previousClose;
                // Update company name if fetched
                if (name) this.stockNames[ticker] = name;
            } else {
                // Remove if Yahoo fails? No, keep existing if any.
            }
        });
        console.log("Updated Base Prices & Names");
    }

    async discoverTicker(ticker) {
        if (this.basePrices[ticker]) return true; // Already exists

        console.log(`Discovering ticker: ${ticker}`);
        const YahooFinanceService = require('./YahooFinanceService');
        const data = await YahooFinanceService.fetchGlobalQuote(ticker);

        if (data) {
            const finalTicker = data.ticker || ticker;
            this.basePrices[finalTicker] = data.price;
            this.previousCloses[finalTicker] = data.previousClose || data.price;
            this.stockNames[finalTicker] = data.name || finalTicker;

            // Seed initial candles
            const CandleStickService = require('./CandleStickService');
            CandleStickService.seedInitialCandles(finalTicker, data.price);

            console.log(`Ticker ${finalTicker} discovered successfully.`);
            return finalTicker; // Return the actual ticker found
        }

        // Try with .NS suffix for Indian stocks if not provided
        if (!ticker.includes('.')) {
            const dataNS = await YahooFinanceService.fetchGlobalQuote(ticker + '.NS');
            if (dataNS) {
                this.basePrices[ticker] = dataNS.price;
                this.previousCloses[ticker] = dataNS.previousClose || dataNS.price;
                this.stockNames[ticker] = dataNS.name || ticker;

                // Seed initial candles
                const CandleStickService = require('./CandleStickService');
                CandleStickService.seedInitialCandles(ticker, dataNS.price);

                console.log(`Ticker ${ticker} discovered with .NS suffix.`);
                return true;
            }
        }

        console.warn(`Failed to discover ticker: ${ticker}`);
        return false;
    }


    stop() {
        this.running = false;
        if (this.intervalId) clearInterval(this.intervalId);
        console.log("Stopping Market Simulation...");
    }

    async runSimulationStep() {
        if (!this.running || !this.botUserId) return;

        const tickers = Object.keys(this.basePrices);

        for (const ticker of tickers) {
            try {
                // Determine current price
                const orderBook = MatchingEngine.getOrderBook(ticker);
                const bestBid = orderBook.getBestBid();
                const bestAsk = orderBook.getBestAsk();

                let currentPrice = this.basePrices[ticker];
                if (bestBid && bestAsk) {
                    currentPrice = (bestBid.price + bestAsk.price) / 2;
                } else if (bestBid) {
                    currentPrice = bestBid.price;
                } else if (bestAsk) {
                    currentPrice = bestAsk.price;
                }

                // Random Walk
                const change = 1 + (Math.random() * this.volatility * 2 - this.volatility);
                let targetPrice = Math.round(currentPrice * change);

                // Spread
                const spread = Math.max(1, Math.round(targetPrice * 0.002)); // 0.2% spread
                const buyPrice = targetPrice - spread;
                const sellPrice = targetPrice + spread;

                // Random Quantity
                const qty = Math.floor(Math.random() * 10) + 1;

                // Place Buy Order (Limit)
                await this.placeOrder(ticker, 'BUY', qty, buyPrice);

                // Place Sell Order (Limit) 
                await this.placeOrder(ticker, 'SELL', qty, sellPrice);

                // Occasionally place a Market order to eat liquidity and move price
                if (Math.random() > 0.7) {
                    const type = Math.random() > 0.5 ? 'MARKET_BUY' : 'MARKET_SELL';
                    await this.placeOrder(ticker, type, 1, 0);
                }

            } catch (err) {
                console.error(`Simulation Error for ${ticker}:`, err.message);
            }
        }
    }

    async placeOrder(ticker, type, quantity, price) {
        try {
            const order = new Order({
                userId: this.botUserId,
                ticker,
                type,
                quantity,
                price,
                status: 'OPEN'
            });

            await order.save();
            await MatchingEngine.processOrder(order);
            // console.log(`[BOT] Placed ${type} on ${ticker} @ ${price}`);
        } catch (err) {
            console.error("Bot Order Failed:", err.message);
        }
    }
}

module.exports = new SimulationService();
