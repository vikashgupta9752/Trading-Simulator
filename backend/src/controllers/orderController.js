const Order = require('../models/Order');
const Trade = require('../models/Trade');
const matchingEngine = require('../engine/MatchingEngine');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private
const placeOrder = async (req, res) => {
    const { ticker, type, price, quantity } = req.body;

    if (!ticker || !type || !quantity) {
        res.status(400).json({ message: 'Please add all fields' });
        return;
    }

    if ((type === 'BUY' || type === 'SELL') && !price) {
        res.status(400).json({ message: 'Price is required for Limit Orders' });
        return;
    }

    if (type.includes('STOP_LOSS') && !req.body.triggerPrice) {
        res.status(400).json({ message: 'Trigger Price is required for Stop Loss Orders' });
        return;
    }

    // Check User Balance / Portfolio
    const user = await req.user; // User is attached by protect middleware, but we need fresh data or just use req.user if it's fresh
    // Actually req.user is from User.findById in middleware, so it's fresh enough.



    if (type === 'BUY') {
        const totalCost = price * quantity;
        if (user.balance < totalCost) {
            return res.status(400).json({ message: `Insufficient balance. Required: ${totalCost}, Available: ${user.balance}` });
        }
        user.balance -= totalCost;
    } else if (type === 'MARKET_BUY') {
        // For Market Buy, we verify user has SOME balance. 
        // Real-world: Lock estimated cost (e.g. 1.1 * bestAsk * qty).
        // For simulation: Check if balance > 0. Actual deduction happens in MatchingEngine.
        if (user.balance <= 0) {
            return res.status(400).json({ message: `Insufficient balance for Market Buy.` });
        }
    } else if (type === 'SELL' || type === 'MARKET_SELL') {
        const asset = user.portfolio.find(p => p.ticker === ticker);
        if (!asset || asset.quantity < quantity) {
            return res.status(400).json({ message: `Insufficient stock quantity. Required: ${quantity}, Available: ${asset ? asset.quantity : 0}` });
        }
        asset.quantity -= quantity;
    }

    await user.save();

    // Create Order in DB
    const orderData = {
        userId: req.user.id,
        ticker,
        type,
        quantity,
        status: 'OPEN'
    };
    if (price) orderData.price = price;
    if (req.body.triggerPrice) orderData.triggerPrice = req.body.triggerPrice;

    const order = await Order.create(orderData);

    console.log(`Received Order: ${order._id} ${type} ${ticker} @ ${price} x ${quantity}`);

    // Process Order in Matching Engine
    // Note: processing is async, but we might want to await it to return trade results immediately
    // or just return "Order Placed" and let it process in background.
    // For this simulation, awaiting is better to see immediate results.
    const trades = await matchingEngine.processOrder(order);

    res.status(201).json({
        message: 'Order placed',
        order,
        trades
    });
};

// @desc    Get Order Book for a ticker
// @route   GET /api/orders/book/:ticker
// @access  Public
const getOrderBook = async (req, res) => {
    const { ticker } = req.params;
    const orderBook = matchingEngine.getOrderBook(ticker);
    const depth = orderBook.getDepth();
    res.status(200).json(depth);
};

// @desc    Get user's orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res) => {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
};

// @desc    Get user's trades
// @route   GET /api/orders/trades
// @access  Private
const getMyTrades = async (req, res) => {
    const trades = await Trade.find({
        $or: [{ buyerId: req.user.id }, { sellerId: req.user.id }]

    }).sort({ createdAt: -1 });
    res.status(200).json(trades);
};

// @desc    Cancel an order
// @route   DELETE /api/orders/:id
// @access  Private
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check user ownership
        if (order.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Check status
        if (order.status === 'FILLED' || order.status === 'CANCELLED') {
            return res.status(400).json({ message: 'Cannot cancel filled or already cancelled order' });
        }

        // Remove from Matching Engine
        matchingEngine.cancelOrder(order);

        // Refund User
        const user = await User.findById(req.user.id);
        if (order.type === 'BUY') {
            user.balance += order.price * order.quantity; // Refund remaining cost
        } else {
            const asset = user.portfolio.find(p => p.ticker === order.ticker);
            if (asset) {
                asset.quantity += order.quantity;
            } else {
                user.portfolio.push({ ticker: order.ticker, quantity: order.quantity });
            }
        }
        await user.save();

        // Update DB
        order.status = 'CANCELLED';
        await order.save();

        res.status(200).json({ message: 'Order cancelled', order });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    placeOrder,
    getOrderBook,
    getMyOrders,
    getMyTrades,
    cancelOrder
};
