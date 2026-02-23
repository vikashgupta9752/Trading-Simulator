
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./src/models/Order');
const User = require('./src/models/User');

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB Connected');

        // Create a user
        const user = await User.create({
            username: `testuser_${Date.now()}`,
            password: 'password123',
            balance: 10000
        });
        console.log('User created:', user._id);

        // Try to create an order
        const orderData = {
            userId: user._id,
            ticker: 'TCS',
            type: 'BUY',
            quantity: 10,
            price: 100,
            status: 'OPEN'
        };

        const order = await Order.create(orderData);
        console.log('Order created:', order._id);

        // Try to create a Stop Loss order
        const slOrderData = {
            userId: user._id,
            ticker: 'TCS',
            type: 'STOP_LOSS_SELL',
            quantity: 5,
            triggerPrice: 90,
            status: 'OPEN'
        };
        const slOrder = await Order.create(slOrderData);
        console.log('SL Order created:', slOrder._id);

        console.log('Success');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

run();
