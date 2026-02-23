const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('../models/Order');
const User = require('../models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const generateOrders = async () => {
    await connectDB();

    const ticker = 'RELIANCE';
    const basePrice = 2900;
    const countPerSide = 50000;

    // Find or create bot user
    let bot = await User.findOne({ username: 'market_maker_bot' });
    if (!bot) {
        console.log("Creating Market Maker Bot...");
        bot = new User({
            username: 'market_maker_bot',
            password: 'bot_password_secure',
            balance: 1000000000,
            portfolio: [{ ticker, quantity: 10000000 }]
        });
        await bot.save();
    }

    console.log(`Generating ${countPerSide} buy and ${countPerSide} sell orders for ${ticker}...`);

    const orders = [];
    const startTime = Date.now();

    // Generate Buy Orders (slightly below base price)
    for (let i = 0; i < countPerSide; i++) {
        const price = basePrice - (Math.random() * 500 + 1); // 2400 to 2899
        orders.push({
            userId: bot._id,
            ticker,
            type: 'BUY',
            price: Math.round(price * 100) / 100,
            quantity: Math.floor(Math.random() * 100) + 1,
            status: 'OPEN',
            createdAt: new Date(startTime - i * 1000) // Spread out timestamps slightly
        });
    }

    // Generate Sell Orders (slightly above base price)
    for (let i = 0; i < countPerSide; i++) {
        const price = basePrice + (Math.random() * 500 + 1); // 2901 to 3400
        orders.push({
            userId: bot._id,
            ticker,
            type: 'SELL',
            price: Math.round(price * 100) / 100,
            quantity: Math.floor(Math.random() * 100) + 1,
            status: 'OPEN',
            createdAt: new Date(startTime - i * 1000)
        });
    }

    console.log(`Inserting ${orders.length} orders into database... (this may take a few seconds)`);

    // Insert in batches to avoid memory issues or driver timeouts
    const batchSize = 10000;
    for (let i = 0; i < orders.length; i += batchSize) {
        const batch = orders.slice(i, i + batchSize);
        await Order.insertMany(batch);
        console.log(`Inserted ${i + batch.length}/${orders.length} orders...`);
    }

    const endTime = Date.now();
    console.log(`Successfully generated and inserted 100,000 orders in ${(endTime - startTime) / 1000}s`);
    process.exit(0);
};

generateOrders();
