const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

class YahooFinanceService {
    constructor() {
        // Yahoo Finance usually doesn't need an API key for basic scraping
    }

    async fetchGlobalQuote(symbol) {
        try {
            const ticker = symbol.toUpperCase();
            // Map symbols to Yahoo Finance format
            let querySymbol = ticker;
            const indianStocks = ['TCS', 'INFY', 'WIPRO', 'RELIANCE', 'HDFCBANK', 'ADANIENT', 'TATAMOTORS', 'ZOMATO', 'PAYTM', 'IRFC', 'JIOFIN', 'NBCC', 'RVNL'];

            if (indianStocks.includes(ticker)) {
                querySymbol = ticker + '.NS';
            } else if (ticker === 'SENSEX') {
                querySymbol = '^BSESN';
            } else if (ticker === 'NIFTY50') {
                querySymbol = '^NSEI';
            } else if (ticker === 'BANKNIFTY') {
                querySymbol = '^NSEBANK';
            }

            let quote = await yahooFinance.quote(querySymbol).catch(() => null);

            // If it failed and has no dot, try with .NS automatically
            if (!quote && !ticker.includes('.')) {
                console.log(`[YahooFinance] Retrying ${ticker} with .NS suffix...`);
                quote = await yahooFinance.quote(ticker + '.NS').catch(() => null);
                if (!quote) {
                    console.log(`[YahooFinance] Retrying ${ticker} with .BO suffix...`);
                    quote = await yahooFinance.quote(ticker + '.BO').catch(() => null);
                }
            }

            // AUTO-CORRECT: If still no quote, try searching for the name
            if (!quote) {
                console.log(`[YahooFinance] No quote for ${ticker}, attempting search lookup...`);
                const bestMatch = await this.searchSymbol(ticker);
                if (bestMatch && bestMatch !== ticker) {
                    console.log(`[YahooFinance] Found potential match for ${ticker}: ${bestMatch}`);
                    quote = await yahooFinance.quote(bestMatch).catch(() => null);
                }
            }

            if (quote && quote.regularMarketPrice) {
                return {
                    ticker: quote.symbol, // Return the actual symbol found
                    price: quote.regularMarketPrice,
                    previousClose: quote.regularMarketPreviousClose || quote.regularMarketPrice,
                    name: quote.longName || quote.shortName || quote.displayName || ticker
                };
            }

            // MANUAL FALLBACK for demo stability if Yahoo fails for these specific symbols
            const fallbacks = {
                'ZOMATO': { price: 265.40, name: 'Zomato Limited' },
                'PAYTM': { price: 785.20, name: 'One 97 Communications Limited' },
                'IRFC': { price: 175.50, name: 'Indian Railway Finance Corporation' }
            };

            if (fallbacks[ticker]) {
                console.log(`[YahooFinance] Using manual fallback for ${ticker}`);
                return {
                    ticker: ticker,
                    price: fallbacks[ticker].price,
                    previousClose: fallbacks[ticker].price * 0.98,
                    name: fallbacks[ticker].name
                };
            }

            console.warn(`[YahooFinance] No price found for ${querySymbol}`);
            return null;
        } catch (error) {
            console.error(`[YahooFinance] Error fetching ${symbol}:`, error.message);
            return null;
        }
    }

    async searchSymbol(query) {
        try {
            const results = await yahooFinance.search(query);
            if (results && results.quotes && results.quotes.length > 0) {
                // Filter for equities or use the first result
                const bestMatch = results.quotes.find(q => q.quoteType === 'EQUITY' || q.quoteType === 'INDEX') || results.quotes[0];
                return bestMatch.symbol;
            }
            return null;
        } catch (error) {
            console.error(`[YahooFinance] Search lookup failed for ${query}:`, error.message);
            return null;
        }
    }

    async fetchInitialPrices(tickers) {
        console.log("Fetching real prices from Yahoo Finance...");
        const prices = {};

        // Yahoo Finance is faster and less restricted, we can parallelize to some extent
        // But let's keep it simple and sequential or processed in chunks to avoid IP blocks

        for (const ticker of tickers) {
            const data = await this.fetchGlobalQuote(ticker);
            if (data) {
                prices[ticker] = data; // Store full object { price, previousClose }
                console.log(`Fetched ${ticker}: ${data.price}`);
            } else {
                console.log(`Using default for ${ticker} (Yahoo failed)`);
            }
            // Small delay
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        return prices;
    }
}

module.exports = new YahooFinanceService();
