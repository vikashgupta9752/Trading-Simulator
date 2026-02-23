const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');
const Order = require('../src/models/Order');
const matchingEngine = require('../src/engine/MatchingEngine');
const connectDB = require('../src/config/db');

dotenv.config();

const runBenchmark = async () => {
    await connectDB();

    console.log('Starting Benchmark...');

    // Clear Orders and Trades and Users
    await Order.deleteMany({});
    await User.deleteMany({});
    // We won't clear users, just use existing ones or create dummy ones

    // Create a dummy user if not exists
    let user = await User.findOne({ email: 'benchmark@test.com' });
    if (!user) {
        user = await User.create({
            username: 'BenchmarkUser',
            email: 'benchmark@test.com',
            password: 'password123',
            balance: 10000000,
            portfolio: []
        });
    }

    const TICKER = 'BENCH';
    const numOrders = 1000;

    console.log(`Placing ${numOrders} Orders for ${TICKER}...`);

    const orders = [];
    for (let i = 0; i < numOrders; i++) {
        const type = i % 2 === 0 ? 'BUY' : 'SELL';
        const price = 100 + (Math.random() * 10).toFixed(2);
        const quantity = Math.floor(Math.random() * 10) + 1;

        const order = new Order({
            userId: user._id,
            ticker: TICKER,
            type,
            price,
            quantity,
            status: 'OPEN'
        });
        orders.push(order);
    }

    const startTime = process.hrtime();

    // Use Promise.all to simulate concurrency
    await Promise.all(orders.map(order => matchingEngine.processOrder(order)));

    const endTime = process.hrtime(startTime);
    const totalTimeMs = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed(3);

    console.log(`Benchmark Complete.`);
    console.log(`Processed ${numOrders} orders in ${totalTimeMs} ms.`);
    console.log(`Average time per order: ${(totalTimeMs / numOrders).toFixed(3)} ms`);

    process.exit();
};

runBenchmark();
