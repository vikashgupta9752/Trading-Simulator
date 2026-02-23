const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Add funds to wallet
// @route   POST /api/wallet/add
// @access  Private
const addFunds = async (req, res) => {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
        res.status(400).json({ message: 'Invalid amount' });
        return;
    }

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        user.balance = (user.balance || 0) + Number(amount);
        await user.save();

        await Transaction.create({
            userId: user.id,
            type: 'DEPOSIT',
            amount: Number(amount),
            description: 'Wallet Top Up'
        });

        res.status(200).json({
            balance: user.balance,
            message: `Successfully added ₹${amount}`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Withdraw funds
// @route   POST /api/wallet/withdraw
// @access  Private
const withdrawFunds = async (req, res) => {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
        res.status(400).json({ message: 'Invalid amount' });
        return;
    }

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (user.balance < amount) {
            res.status(400).json({ message: 'Insufficient funds' });
            return;
        }

        user.balance -= Number(amount);
        await user.save();

        await Transaction.create({
            userId: user.id,
            type: 'WITHDRAWAL',
            amount: Number(amount),
            description: 'Wallet Withdrawal'
        });

        res.status(200).json({
            balance: user.balance,
            message: `Successfully withdrew ₹${amount}`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get transaction history
// @route   GET /api/wallet/history
// @access  Private
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    addFunds,
    withdrawFunds,
    getTransactions
};
