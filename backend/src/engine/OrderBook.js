const PriorityQueue = require('./PriorityQueue');

class OrderBook {
    constructor(ticker) {
        this.ticker = ticker;

        // Buy Orders: Max Heap (Higher price first). Same price -> Earlier time first.
        this.buyOrders = new PriorityQueue((a, b) => {
            if (b.price !== a.price) {
                return b.price - a.price; // Descending price
            }
            return a.createdAt - b.createdAt; // Ascending time (earlier is smaller timestamp)
        });

        // Sell Orders: Min Heap (Lower price first). Same price -> Earlier time first.
        this.sellOrders = new PriorityQueue((a, b) => {
            if (a.price !== b.price) {
                return a.price - b.price; // Ascending price
            }
            return a.createdAt - b.createdAt; // Ascending time
        });
    }

    addOrder(order) {
        if (order.type === 'BUY') {
            this.buyOrders.push(order);
        } else {
            this.sellOrders.push(order);
        }
    }

    removeOrder(orderId) {
        // This is O(N) but acceptable given JS limitations for now.
        // A hashmap mapping ID -> Node could optimize this but requires custom heap implementation.
        const predicate = (o) => o._id.toString() === orderId.toString();
        // Try removing from both (we might not know type easily if just ID passed, though caller usually knows)
        // Optimization: Caller should pass type if possible.
        // For now, let's assume we search both if not found in one, or just both.

        let removed = this.buyOrders.remove(predicate);
        if (!removed) {
            this.sellOrders.remove(predicate);
        }
    }

    getBestBid() {
        return this.buyOrders.peek();
    }

    getBestAsk() {
        return this.sellOrders.peek();
    }

    // Helper to view depth (Top N)
    getDepth(limit = 10) {
        // Cloning heaps to sort without destroying is expensive but necessary for full view
        // Ideally we maintain a separate aggregated view for depth. 
        // For this project, we can convert to array and sort.
        const bids = this.buyOrders.toArray().sort(this.buyOrders.comparator).slice(0, limit);
        const asks = this.sellOrders.toArray().sort(this.sellOrders.comparator).slice(0, limit);

        return { bids, asks };
    }
}

module.exports = OrderBook;
