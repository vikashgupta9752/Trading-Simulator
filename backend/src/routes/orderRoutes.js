const express = require('express');
const router = express.Router();
const { placeOrder, getOrderBook, getMyOrders, getMyTrades, cancelOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, placeOrder);
router.get('/book/:ticker', getOrderBook);
router.get('/my', protect, getMyOrders);
router.get('/trades', protect, getMyTrades);
router.delete('/:id', protect, cancelOrder);

module.exports = router;
