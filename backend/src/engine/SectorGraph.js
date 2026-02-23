class SectorGraph {
    constructor() {
        this.adjList = new Map();
        this.stockToSector = new Map();
    }

    addStock(ticker, sector) {
        if (!this.adjList.has(ticker)) {
            this.adjList.set(ticker, new Set());
        }
        this.stockToSector.set(ticker, sector);

        // Connect to other stocks in the same sector
        for (let [otherTicker, otherSector] of this.stockToSector.entries()) {
            if (ticker !== otherTicker && sector === otherSector) {
                this.addEdge(ticker, otherTicker);
            }
        }
    }

    addEdge(v1, v2) {
        this.adjList.get(v1).add(v2);
        this.adjList.get(v2).add(v1);
    }

    getCorrelatedStocks(ticker) {
        return Array.from(this.adjList.get(ticker) || []);
    }

    getSector(ticker) {
        return this.stockToSector.get(ticker);
    }
}

module.exports = new SectorGraph();
