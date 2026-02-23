const express = require('express');
const router = express.Router();
const { addFunds, withdrawFunds, getTransactions } = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, addFunds);
router.post('/withdraw', protect, withdrawFunds);
router.get('/history', protect, getTransactions);

module.exports = router;
