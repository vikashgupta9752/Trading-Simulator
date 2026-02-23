const Trade = require('../models/Trade');
const Order = require('../models/Order');
const User = require('../models/User');
const CandleStickService = require('./CandleStickService');

const { Mutex } = require('async-mutex');

class MatchingEngine {
    constructor() {
        this.orderBooks = {}; // key: ticker, value: OrderBook instance
        this.stopLossOrders = {}; // key: ticker, value: Array of orders
        this.io = null;
        this.mutex = new Mutex(); // Global mutex for the engine (or could be per-ticker, but global is safer for cross-ticker portfolio logic if any)
    }

    addStopLossOrder(order) {
        if (!this.stopLossOrders[order.ticker]) {
            this.stopLossOrders[order.ticker] = [];
        }
        this.stopLossOrders[order.ticker].push(order);
    }

    setIo(io) {
        this.io = io;
        CandleStickService.setIo(io);
    }

    notifyOrderBookUpdate(ticker) {
        if (this.io) {
            const orderBook = this.getOrderBook(ticker);
            const depth = orderBook.getDepth();
            this.io.emit('orderBookUpdate', { ticker, ...depth });
        }
    }

    notifyTradeUpdate(trade) {
        if (this.io) {
            this.io.emit('tradeUpdate', trade);
        }
        CandleStickService.setIo(this.io); // Ensure one-time set or check? Better to set in setIo
        this.checkStopLosses(trade);
    }

    async checkStopLosses(trade) {
        const ticker = trade.ticker;
        const currentPrice = trade.price;

        if (!this.stopLossOrders[ticker] || this.stopLossOrders[ticker].length === 0) return;

        // Filter out triggered orders to process them
        const triggeredOrders = [];
        const remainingOrders = [];

        this.stopLossOrders[ticker].forEach(order => {
            let triggered = false;
            // STOP_LOSS_SELL: Trigger if price <= triggerPrice (Protective put / Stop sell)
            if (order.type === 'STOP_LOSS_SELL' && currentPrice <= order.triggerPrice) {
                triggered = true;
            }
            // STOP_LOSS_BUY: Trigger if price >= triggerPrice (Stop buy)
            else if (order.type === 'STOP_LOSS_BUY' && currentPrice >= order.triggerPrice) {
                triggered = true;
            }

            if (triggered) {
                triggeredOrders.push(order);
            } else {
                remainingOrders.push(order);
            }
        });

        this.stopLossOrders[ticker] = remainingOrders;

        // Execute triggered orders as MARKET orders (as per prompt "Auto sell trigger")
        for (const order of triggeredOrders) {
            console.log(`Stop Loss Triggered for Order ${order._id} at ${currentPrice}`);

            // Convert to MARKET order in DB
            order.type = order.type === 'STOP_LOSS_BUY' ? 'MARKET_BUY' : 'MARKET_SELL';
            order.status = 'OPEN'; // Reset status to process
            await Order.findByIdAndUpdate(order._id, { type: order.type, status: 'OPEN' });

            // Process immediately
            this.processOrder(order);
        }
    }

    getOrderBook(ticker) {
        const OrderBook = require('./OrderBook');
        if (!this.orderBooks[ticker]) {
            this.orderBooks[ticker] = new OrderBook(ticker);
        }
        return this.orderBooks[ticker];
    }

    async loadOpenOrders() {
        try {
            console.log("Loading open orders from database...");
            const openOrders = await Order.find({ status: { $in: ['OPEN', 'PARTIAL'] } });

            let loadedCount = 0;
            for (const order of openOrders) {
                if (order.type.includes('STOP_LOSS')) {
                    this.addStopLossOrder(order);
                } else {
                    const orderBook = this.getOrderBook(order.ticker);
                    orderBook.addOrder(order);
                }
                loadedCount++;
            }

            console.log(`Successfully loaded ${loadedCount} orders into memory engine.`);

            // Notify for all tickers that have orders
            const tickers = [...new Set(openOrders.map(o => o.ticker))];
            tickers.forEach(ticker => this.notifyOrderBookUpdate(ticker));

        } catch (err) {
            console.error("Failed to load open orders:", err);
        }
    }

    async processOrder(order) {
        return await this.mutex.runExclusive(async () => {
            const orderBook = this.getOrderBook(order.ticker);

            // Start Timer
            const start = process.hrtime();

            // Match logic
            let trades = [];

            if (order.type === 'BUY' || order.type === 'IOC_BUY') {
                trades = await this.matchBuyOrder(order, orderBook);
            } else if (order.type === 'SELL' || order.type === 'IOC_SELL') {
                trades = await this.matchSellOrder(order, orderBook);
            } else if (order.type === 'MARKET_BUY') {
                trades = await this.matchMarketBuy(order, orderBook);
            } else if (order.type === 'MARKET_SELL') {
                trades = await this.matchMarketSell(order, orderBook);
            } else if (order.type.includes('STOP_LOSS')) {
                this.addStopLossOrder(order);
                const end = process.hrtime(start);
                const timeInMs = (end[0] * 1000 + end[1] / 1e6).toFixed(3);
                console.log(`[PERF] Stop Loss Added: ${order.ticker} ${order.type} in ${timeInMs} ms`);
                return [];
            }

            // IOC Logic: If IOC and not fully filled, CANCEL remainder immediately
            if (order.type.includes('IOC') && order.quantity > 0 && order.status !== 'FILLED') {
                order.status = trades.length > 0 ? 'PARTIAL' : 'CANCELLED'; // Or just CANCELLED implies partial if trades exist? Using CANCELLED for remainder.
                // Actually, if it's partially filled, the order status in DB should reflect that recursive state? 
                // No, IOC remainder is cancelled. 
                // We don't add to book.
                await Order.findByIdAndUpdate(order._id, { status: 'CANCELLED', quantity: 0 }); // Effectively 0 for active tracking? Or keep remnant quantity but status cancelled?
                // Let's set quantity to 0 to be clean.
            } else if (order.quantity > 0 && order.status !== 'FILLED') {
                // Regular Limit Order: Add remainder to book
                orderBook.addOrder(order);
            }

            const end = process.hrtime(start);
            const timeInMs = (end[0] * 1000 + end[1] / 1e6).toFixed(3);
            console.log(`[PERF] Order Processed: ${order.ticker} ${order.type} Qty:${order.quantity} Trades:${trades.length} in ${timeInMs} ms`);

            this.notifyOrderBookUpdate(order.ticker);

            // Trigger Price Simulation?
            // Maybe random walk every N orders or on timer?
            // For now, let's keep it simple.

            return trades;
        });
    }

    cancelOrder(order) {
        const orderBook = this.getOrderBook(order.ticker);
        orderBook.removeOrder(order);
        this.notifyOrderBookUpdate(order.ticker);
    }

    async matchBuyOrder(buyOrder, orderBook) {
        let trades = [];
        let sellOrders = orderBook.sellOrders;

        while (buyOrder.quantity > 0 && !sellOrders.isEmpty()) {
            let bestAsk = sellOrders.peek();

            // If best ask is higher than buy price, stop
            if (bestAsk.price > buyOrder.price) {
                break;
            }

            let sellOrder = bestAsk; // We'll pop later if filled, or update qty

            // Determine trade quantity
            let tradeQty = Math.min(buyOrder.quantity, sellOrder.quantity);
            let tradePrice = sellOrder.price; // Trade executes at the resting order's price

            // Execute Trade
            let trade = new Trade({
                buyerId: buyOrder.userId,
                sellerId: sellOrder.userId,
                ticker: buyOrder.ticker,
                price: tradePrice,
                quantity: tradeQty
            });

            trades.push(trade);
            await trade.save();
            trades.push(trade);
            await trade.save();
            this.notifyTradeUpdate(trade);
            CandleStickService.updateCandle(trade);

            // Update User Balances/Portfolio
            const buyer = await User.findById(buyOrder.userId);
            const seller = await User.findById(sellOrder.userId);

            // Buyer gets stock
            const asset = buyer.portfolio.find(p => p.ticker === buyOrder.ticker);
            if (asset) {
                asset.quantity += tradeQty;
            } else {
                buyer.portfolio.push({ ticker: buyOrder.ticker, quantity: tradeQty });
            }
            await buyer.save();

            // Seller gets money
            seller.balance += tradePrice * tradeQty;
            await seller.save();

            // Update quantities
            buyOrder.quantity -= tradeQty;
            sellOrder.quantity -= tradeQty;

            // Update Buy Order status partial
            buyOrder.status = buyOrder.quantity === 0 ? 'FILLED' : 'PARTIAL';

            // Update Sell Order status
            if (sellOrder.quantity === 0) {
                sellOrder.status = 'FILLED';
                sellOrders.pop(); // Remove filled order from heap
                await Order.findByIdAndUpdate(sellOrder._id, { status: 'FILLED', quantity: 0 });
            } else {
                sellOrder.status = 'PARTIAL';
                // Heap might need re-ordering if key changed? No, priority key (price, time) didn't change. 
                // Just quantity changed. Heap integrity matches validity.
                await Order.findByIdAndUpdate(sellOrder._id, { status: 'PARTIAL', quantity: sellOrder.quantity });
            }
        }

        // Update Buy Order in DB
        await Order.findByIdAndUpdate(buyOrder._id, {
            status: buyOrder.status,
            quantity: buyOrder.quantity
        });

        return trades;
    }

    async matchSellOrder(sellOrder, orderBook) {
        let trades = [];
        let buyOrders = orderBook.buyOrders;

        while (sellOrder.quantity > 0 && !buyOrders.isEmpty()) {
            let bestBid = buyOrders.peek();

            // If best bid is lower than sell price, stop
            if (bestBid.price < sellOrder.price) {
                break;
            }

            let buyOrder = bestBid;

            let tradeQty = Math.min(sellOrder.quantity, buyOrder.quantity);
            let tradePrice = buyOrder.price; // Execute at resting buy price

            let trade = new Trade({
                buyerId: buyOrder.userId,
                sellerId: sellOrder.userId,
                ticker: sellOrder.ticker,
                price: tradePrice,
                quantity: tradeQty
            });

            trades.push(trade);
            await trade.save();
            trades.push(trade);
            await trade.save();
            this.notifyTradeUpdate(trade);
            CandleStickService.updateCandle(trade);

            // Update User Balances/Portfolio
            const buyer = await User.findById(buyOrder.userId);
            const seller = await User.findById(sellOrder.userId);

            // Buyer gets stock
            const asset = buyer.portfolio.find(p => p.ticker === sellOrder.ticker);
            if (asset) {
                asset.quantity += tradeQty;
            } else {
                buyer.portfolio.push({ ticker: sellOrder.ticker, quantity: tradeQty });
            }
            await buyer.save();

            // Seller gets money
            seller.balance += tradePrice * tradeQty;
            await seller.save();

            sellOrder.quantity -= tradeQty;
            buyOrder.quantity -= tradeQty;

            sellOrder.status = sellOrder.quantity === 0 ? 'FILLED' : 'PARTIAL';

            if (buyOrder.quantity === 0) {
                buyOrder.status = 'FILLED';
                buyOrders.pop(); // Remove
                await Order.findByIdAndUpdate(buyOrder._id, { status: 'FILLED', quantity: 0 });
            } else {
                buyOrder.status = 'PARTIAL';
                await Order.findByIdAndUpdate(buyOrder._id, { status: 'PARTIAL', quantity: buyOrder.quantity });
            }
        }

        await Order.findByIdAndUpdate(sellOrder._id, {
            status: sellOrder.status,
            quantity: sellOrder.quantity
        });

        return trades;
    }

    async matchMarketBuy(buyOrder, orderBook) {
        let trades = [];
        let sellOrders = orderBook.sellOrders;

        // Market Buy: match against lowest Asks until filled or valid quantity exhausted
        while (buyOrder.quantity > 0 && !sellOrders.isEmpty()) {
            let sellOrder = sellOrders.peek(); // Peek best ask

            // Check Buyer Balance (since price wasn't locked upfront)
            const buyer = await User.findById(buyOrder.userId);
            const tradePrice = sellOrder.price;

            // Calculate affordable quantity
            // We need to re-fetch buyer every time because balance changes? 
            // Yes, strict serialization via mutex helps, but here we are inside mutex.
            // So `buyer` object is stale if we don't update it or track it in memory.
            // But we save it after match. So we should re-fetch or update local variable.

            // Optimization: Track balance locally to avoid DB hits in loop?
            // For safety, let's trust DB or variable. 
            // In this implementation, I'll re-fetch or use updated object.

            // Actually, we can just use the buyer object and update it.
            // But `User.findById` returns a mongoose document.

            let currentBalance = buyer.balance;
            let tradeQty = Math.min(buyOrder.quantity, sellOrder.quantity);

            if (currentBalance < tradeQty * tradePrice) {
                tradeQty = Math.floor(currentBalance / tradePrice);
                if (tradeQty === 0) break; // Cannot afford any at this price
            }

            let trade = new Trade({
                buyerId: buyOrder.userId,
                sellerId: sellOrder.userId,
                ticker: buyOrder.ticker,
                price: tradePrice,
                quantity: tradeQty
            });

            trades.push(trade);
            await trade.save();
            trades.push(trade);
            await trade.save();
            this.notifyTradeUpdate(trade);
            CandleStickService.updateCandle(trade);

            // Update Portfolios
            buyer.balance -= tradePrice * tradeQty; // Deduct cost

            const asset = buyer.portfolio.find(p => p.ticker === buyOrder.ticker);
            if (asset) asset.quantity += tradeQty;
            else buyer.portfolio.push({ ticker: buyOrder.ticker, quantity: tradeQty });
            await buyer.save();

            const seller = await User.findById(sellOrder.userId);
            seller.balance += tradePrice * tradeQty;
            await seller.save();

            // Update Quantities
            buyOrder.quantity -= tradeQty;
            sellOrder.quantity -= tradeQty;

            if (sellOrder.quantity === 0) {
                sellOrder.status = 'FILLED';
                sellOrders.pop(); // Remove filled order
                await Order.findByIdAndUpdate(sellOrder._id, { status: 'FILLED', quantity: 0 });
            } else {
                sellOrder.status = 'PARTIAL';
                await Order.findByIdAndUpdate(sellOrder._id, { status: 'PARTIAL', quantity: sellOrder.quantity });
            }
        }

        // Market Order Remainder Handling: CANCELLED (Liquidity exhausted)
        if (buyOrder.quantity > 0) {
            buyOrder.status = trades.length > 0 ? 'PARTIAL' : 'CANCELLED';
            await Order.findByIdAndUpdate(buyOrder._id, { status: buyOrder.status, quantity: buyOrder.quantity });
        } else {
            buyOrder.status = 'FILLED';
            await Order.findByIdAndUpdate(buyOrder._id, { status: 'FILLED', quantity: 0 });
        }

        return trades;
    }

    async matchMarketSell(sellOrder, orderBook) {
        let trades = [];
        let buyOrders = orderBook.buyOrders;

        while (sellOrder.quantity > 0 && !buyOrders.isEmpty()) {
            let buyOrder = buyOrders.peek(); // Peek best bid

            let tradeQty = Math.min(sellOrder.quantity, buyOrder.quantity);
            let tradePrice = buyOrder.price;

            let trade = new Trade({
                buyerId: buyOrder.userId,
                sellerId: sellOrder.userId,
                ticker: sellOrder.ticker,
                price: tradePrice,
                quantity: tradeQty
            });

            trades.push(trade);
            await trade.save();
            trades.push(trade);
            await trade.save();
            this.notifyTradeUpdate(trade);
            CandleStickService.updateCandle(trade);

            // Update Portfolios
            const seller = await User.findById(sellOrder.userId);
            seller.balance += tradePrice * tradeQty;
            await seller.save();

            const buyer = await User.findById(buyOrder.userId);
            // Buyer funds were already locked? YES, for Limit Buy.
            const asset = buyer.portfolio.find(p => p.ticker === buyOrder.ticker);
            if (asset) asset.quantity += tradeQty;
            else buyer.portfolio.push({ ticker: buyOrder.ticker, quantity: tradeQty });
            await buyer.save();

            sellOrder.quantity -= tradeQty;
            buyOrder.quantity -= tradeQty;

            if (buyOrder.quantity === 0) {
                buyOrder.status = 'FILLED';
                buyOrders.pop();
                await Order.findByIdAndUpdate(buyOrder._id, { status: 'FILLED', quantity: 0 });
            } else {
                buyOrder.status = 'PARTIAL';
                await Order.findByIdAndUpdate(buyOrder._id, { status: 'PARTIAL', quantity: buyOrder.quantity });
            }
        }

        if (sellOrder.quantity > 0) {
            sellOrder.status = trades.length > 0 ? 'PARTIAL' : 'CANCELLED';
            await Order.findByIdAndUpdate(sellOrder._id, { status: sellOrder.status, quantity: sellOrder.quantity });
        } else {
            sellOrder.status = 'FILLED';
            await Order.findByIdAndUpdate(sellOrder._id, { status: 'FILLED', quantity: 0 });
        }

        return trades;
    }
}

module.exports = new MatchingEngine();
