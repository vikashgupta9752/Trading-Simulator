class StockSearch {
    constructor() {
        this.stocks = []; // Array of objects { ticker, name }
    }

    updateStocks(stockData) {
        // stockData: { 'TCS': 'Tata Consultancy Services', ... }
        this.stocks = Object.entries(stockData).map(([ticker, name]) => ({
            ticker,
            name: name.toUpperCase()
        }));
        // Sort by ticker for binary search
        this.stocks.sort((a, b) => a.ticker.localeCompare(b.ticker));
    }

    searchByTicker(ticker) {
        ticker = ticker.toUpperCase();
        let left = 0;
        let right = this.stocks.length - 1;

        while (left <= right) {
            let mid = Math.floor((left + right) / 2);
            if (this.stocks[mid].ticker === ticker) {
                return this.stocks[mid];
            }
            if (this.stocks[mid].ticker < ticker) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return null;
    }

    // Prefix search using binary search to find range
    searchPrefix(prefix) {
        prefix = prefix.toUpperCase();
        const results = [];

        // Find first occurrence
        let left = 0;
        let right = this.stocks.length - 1;
        let firstIndex = -1;

        while (left <= right) {
            let mid = Math.floor((left + right) / 2);
            if (this.stocks[mid].ticker.startsWith(prefix)) {
                firstIndex = mid;
                right = mid - 1; // Keep looking left
            } else if (this.stocks[mid].ticker < prefix) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        if (firstIndex !== -1) {
            for (let i = firstIndex; i < this.stocks.length; i++) {
                if (this.stocks[i].ticker.startsWith(prefix)) {
                    results.push(this.stocks[i]);
                } else {
                    break;
                }
            }
        }
        return results;
    }
}

module.exports = new StockSearch();
