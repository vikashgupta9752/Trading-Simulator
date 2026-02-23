const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

class AlphaVantageService {
    constructor() {
        if (!API_KEY) {
            console.error("WARNING: Alpha Vantage API Key is missing in .env");
        }
        this.cache = {};
        this.CACHE_DURATION = 60 * 1000;
    }


    async fetchGlobalQuote(symbol) {
        try {
            // Alpha Vantage Global Quote
            // Ticker format: TCS.BSE or INFY.BSE for Indian stocks might be needed if defaults fail.
            // But let's try raw symbol first, or default to .BSE for Indian context if needed.
            // Given the project context (TCS, INFY), these are Indian stocks.
            // Alpha Vantage symbol for TCS is 'TCS.BSE' or 'TCS.TRV'.
            // Let's try to map them if they don't have a suffix.

            let querySymbol = symbol;
            const indianStocks = ['TCS', 'INFY', 'WIPRO', 'RELIANCE', 'HDFCBANK', 'ADANIENT', 'TATAMOTORS'];

            const indexMap = {
                'SENSEX': '^BSESN',
                'NIFTY50': '^NSEI',
                'BANKNIFTY': '^NSEBANK',
                'MIDCAP': 'NIFTY_MIDCAP_50.NSE',
            };

            if (indianStocks.includes(symbol)) {
                querySymbol = symbol + '.NSE';
            } else if (indexMap[symbol]) {
                querySymbol = indexMap[symbol];
            }




            const response = await axios.get(BASE_URL, {
                params: {
                    function: 'GLOBAL_QUOTE',
                    symbol: querySymbol,
                    apikey: API_KEY
                }
            });

            // Debug Log
            console.log(`[AlphaVantage] Response for ${querySymbol}:`, JSON.stringify(response.data));

            if (response.data['Global Quote'] && response.data['Global Quote']['05. price']) {
                const data = response.data['Global Quote'];
                const price = parseFloat(data['05. price']);
                const prevClose = parseFloat(data['08. previous close']);
                const finalPrice = price || prevClose;

                if (finalPrice) {
                    this.cache[symbol] = { price: finalPrice, timestamp: Date.now() };
                }
                return finalPrice;
            } else if (response.data['Note']) {
                console.warn(`[AlphaVantage] Limit Reached for ${symbol}. NOTE: ${response.data['Note']}`);
                if (this.cache[symbol]) return this.cache[symbol].price;
                return null;
            } else {
                console.warn(`[AlphaVantage] No valid data for ${symbol}. Response:`, response.data);
                return null;
            }
            return null;
        } catch (error) {
            console.error(`Error fetching data for ${symbol}:`, error.message);
            if (this.cache[symbol]) return this.cache[symbol].price;
            return null;
        }
    }

    async fetchInitialPrices(tickers) {
        console.log("Fetching real prices from Alpha Vantage...");
        const prices = {};

        // Rate limit compliant fetching: 5 requests per minute for free tier.
        // We have ~7 tickers. This will hit the limit.
        // Strategy: Try to fetch as many as possible, or just fetch a few key ones?
        // Or adding a delay? 
        // With 5 req/min, fetching 7 tickers will take > 1 minute if we strict wait.
        // Actually, we can fetch 5, wait a minute, fetch rest? That delays startup.
        // Better approach for "Demo": Fetch what we can, use hardcoded for rest if limit hit.

        for (const ticker of tickers) {
            const price = await this.fetchGlobalQuote(ticker);
            if (price) {
                prices[ticker] = price;
                console.log(`Fetched ${ticker}: ${price}`);
            } else {
                console.log(`Using default for ${ticker} (API failed or limit reached)`);
            }
            // Small delay to be polite, though rate limit will likely hit anyway
            await new Promise(resolve => setTimeout(resolve, 1000));

            // If we hit limit (checked in fetchGlobalQuote 'Note'), we could stop trying?
            // But let's just try all, it handles failure gracefully.
        }

        return prices;
    }
}

module.exports = new AlphaVantageService();
