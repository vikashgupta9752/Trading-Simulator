const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

const passport = require('passport');

// Google OAuth
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        const token = require('../controllers/userController').generateToken(req.user._id);
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?token=${token}`);
    }
);

// GitHub OAuth
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/auth/github/callback',
    passport.authenticate('github', { session: false }),
    (req, res) => {
        const token = require('../controllers/userController').generateToken(req.user._id);
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?token=${token}`);
    }
);

module.exports = router;
