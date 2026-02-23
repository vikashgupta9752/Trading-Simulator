const AlphaVantageService = require('../src/engine/AlphaVantageService');

async function test() {
    console.log("Testing Alpha Vantage Integration...");
    const tickers = ['TCS', 'SENSEX', 'NIFTY50', 'BANKNIFTY'];


    try {
        const prices = await AlphaVantageService.fetchInitialPrices(tickers);
        console.log("Fetched Prices:", prices);

        if (Object.keys(prices).length > 0) {
            console.log("SUCCESS: Fetched data from Alpha Vantage.");
        } else {
            console.log("WARNING: No data fetched. Check API key or limits.");
        }
    } catch (error) {
        console.error("FAILURE:", error);
    }
}

test();
