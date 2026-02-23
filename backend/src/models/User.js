const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true // Allows multiple nulls (for username-only legacy users if any)
    },
    password: {
        type: String,
        required: function () { return !this.googleId && !this.githubId; } // Password not required if OAuth used
    },
    googleId: { type: String, unique: true, sparse: true },
    githubId: { type: String, unique: true, sparse: true },
    balance: {
        type: Number,
        default: 0
    },
    portfolio: [{
        ticker: String,
        quantity: Number,
        averageBuyPrice: { type: Number, default: 0 }
    }]
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
