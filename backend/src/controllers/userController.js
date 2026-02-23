const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    try {
        console.log('[Register] Received request body:', req.body);
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ message: 'Please add all fields' });
            return;
        }

        // Check if user exists
        const userExists = await User.findOne({ username });

        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            username,
            password: hashedPassword,
            balance: 50000, // Initial simulated balance
            portfolio: []
        });

        if (user) {
            console.log(`[Register] User created successfully: ${user.username}`);
            res.status(201).json({
                _id: user.id,
                username: user.username,
                token: generateToken(user.id),
                balance: user.balance,
                portfolio: user.portfolio
            });
        } else {
            console.error(`[Register] Failed to create user: ${username}`);
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(`[Register] Exception for user ${username}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { username, password } = req.body;
    console.log(`[Login] Attempt for username: ${username}`);

    // Check for user email
    const user = await User.findOne({ username });
    console.log(`[Login] User found: ${!!user}`);

    if (user && (await bcrypt.compare(password, user.password))) {
        console.log(`[Login] Password valid`);
        res.json({
            _id: user.id,
            username: user.username,
            balance: user.balance,
            portfolio: user.portfolio,
            token: generateToken(user.id),
        });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
};

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    generateToken
};
