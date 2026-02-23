const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    ticker: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['BUY', 'SELL', 'MARKET_BUY', 'MARKET_SELL', 'STOP_LOSS_BUY', 'STOP_LOSS_SELL', 'IOC_BUY', 'IOC_SELL']
    },
    price: {
        type: Number,
        required: function () { return ['BUY', 'SELL'].includes(this.type); }
    },
    triggerPrice: {
        type: Number,
        required: function () { return this.type.includes('STOP_LOSS'); }
    },
    quantity: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'OPEN',
        enum: ['OPEN', 'FILLED', 'PARTIAL', 'CANCELLED']
    }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
