import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Card from './ui/Card';

const OrderForm = ({ onOrderPlaced, ticker }) => {
    const [quantity, setQuantity] = useState('1');
    const [price, setPrice] = useState('0'); // For Limit orders
    const [triggerPrice, setTriggerPrice] = useState('0'); // For Stop orders
    const [orderType, setOrderType] = useState('MARKET'); // MARKET, LIMIT, STOP_LOSS, IOC
    const [side, setSide] = useState('BUY');

    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [stockInfo, setStockInfo] = useState({ name: ticker, price: 0 });

    // Fetch Full Company Name and Current Price
    useEffect(() => {
        const fetchStockInfo = async () => {
            if (!ticker || !user.token) return;
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/market/status`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const info = res.data.find(s => s.ticker === ticker);
                if (info) {
                    setStockInfo(info);
                    // Autofill price if it's 0 and we switch to LIMIT
                    if (price === '0') setPrice(info.price.toString());
                }
            } catch (err) {
                console.error("Failed to fetch stock info", err);
            }
        };
        fetchStockInfo();
        const interval = setInterval(fetchStockInfo, 5000);
        return () => clearInterval(interval);
    }, [ticker, user.token]);

    const calculateRisk = () => {
        if (orderType === 'MARKET') return { level: 'Low', color: 'text-green-400' };

        const currentPrice = stockInfo.price;
        const targetPrice = parseFloat(price);
        if (!targetPrice || !currentPrice) return { level: 'Unknown', color: 'text-gray-400' };

        const diff = Math.abs(targetPrice - currentPrice) / currentPrice;

        if (diff > 0.10) return { level: 'Very High', color: 'text-red-500', warning: 'Price is >10% from market!' };
        if (diff > 0.05) return { level: 'High', color: 'text-orange-500', warning: 'Price is >5% from market' };
        if (diff > 0.02) return { level: 'Medium', color: 'text-yellow-400' };
        return { level: 'Low', color: 'text-green-400' };
    };

    const risk = calculateRisk();

    const orderTypes = ['MARKET', 'LIMIT', 'STOP_LOSS', 'IOC'];

    const handleTrade = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const token = user.token;
            const config = { headers: { Authorization: `Bearer ${token}` } }; // Correct template literal

            let typeToSend = orderType;
            if (orderType === 'MARKET') typeToSend = side === 'BUY' ? 'MARKET_BUY' : 'MARKET_SELL';
            else if (orderType === 'IOC') typeToSend = side === 'BUY' ? 'IOC_BUY' : 'IOC_SELL';
            // Limit and Stop types usually just 'BUY'/'SELL' with extra fields or specific enums in backend?
            // Backend MatchingEngine checks:
            // if (order.type === 'BUY' || order.type === 'IOC_BUY') -> Limit Buy
            // if (order.type === 'STOP_LOSS_BUY') -> Stop Loss

            // Let's map UI types to Backend enums explicitly
            if (orderType === 'LIMIT') typeToSend = side; // "BUY" or "SELL"
            if (orderType === 'STOP_LOSS') typeToSend = side === 'BUY' ? 'STOP_LOSS_BUY' : 'STOP_LOSS_SELL';

            const orderData = {
                ticker,
                type: typeToSend,
                quantity: Number(quantity),
                price: (orderType === 'LIMIT' || orderType === 'IOC') ? Number(price) : 0,
                triggerPrice: orderType === 'STOP_LOSS' ? Number(triggerPrice) : 0
            };

            await axios.post(`${import.meta.env.VITE_API_URL}/orders`, orderData, config);

            setMessage({ type: 'success', text: `Order Placed: ${orderType} ${side}` });
            if (onOrderPlaced) onOrderPlaced();

            setTimeout(() => setMessage(null), 2000);

        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Order failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="h-full bg-gray-900 border border-gray-800 p-4 flex flex-col gap-4">

            {/* Header */}
            <div className="flex flex-col mb-2 border-b border-gray-800 pb-3">
                <div className="flex justify-between items-center">
                    <span className="text-white font-black text-xl tracking-tight">{ticker}</span>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Live Price</span>
                        <span className="text-sm font-mono font-bold text-blue-400">₹{stockInfo.price.toLocaleString()}</span>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-gray-400 font-medium truncate max-w-[150px]">{stockInfo.name}</span>
                    <span className="text-[10px] text-gray-500">Wallet: ₹{user ? user.balance.toLocaleString() : 0}</span>
                </div>
            </div>

            {/* Buy/Sell Tabs */}
            <div className="flex bg-gray-800 rounded-lg p-1">
                <button
                    onClick={() => setSide('BUY')}
                    className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${side === 'BUY'
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'}`}
                >
                    BUY
                </button>
                <button
                    onClick={() => setSide('SELL')}
                    className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${side === 'SELL'
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'}`}
                >
                    SELL
                </button>
            </div>

            {/* Order Type Selector */}
            <div className="grid grid-cols-4 gap-1">
                {orderTypes.map(t => (
                    <button
                        key={t}
                        onClick={() => setOrderType(t)}
                        className={`py-1 text-[10px] font-bold rounded border ${orderType === t
                            ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                            : 'border-transparent text-gray-500 hover:bg-gray-800'}`}
                    >
                        {t.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Inputs */}
            <div className="space-y-3">
                {/* Quantity */}
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-bold uppercase">Quantity</label>
                    <div className="bg-gray-800 rounded-lg p-2 flex items-center border border-gray-700 focus-within:border-blue-500">
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full bg-transparent border-none text-right text-white font-mono font-bold focus:ring-0"
                            placeholder="0"
                        />
                        <span className="ml-2 text-xs text-gray-500 font-bold">Qty</span>
                    </div>
                </div>

                {/* Price (Limit/IOC) */}
                {(orderType === 'LIMIT' || orderType === 'IOC') && (
                    <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between items-end">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Manual Price</label>
                            <div className="flex gap-1 items-center pb-0.5">
                                <span className="text-[9px] text-gray-600 font-bold uppercase">Risk:</span>
                                <span className={`text-[10px] font-black uppercase ${risk.color}`}>{risk.level}</span>
                            </div>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-3 flex items-center border border-gray-700 focus-within:border-blue-500 transition-all shadow-inner">
                            <span className="text-gray-500 font-bold mr-2">₹</span>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full bg-transparent border-none text-right text-white font-mono text-lg font-black focus:ring-0 p-0"
                                placeholder="0.00"
                            />
                        </div>
                        {risk.warning && (
                            <p className="text-[9px] text-red-400 font-bold italic mt-1 bg-red-500/10 p-1 rounded border border-red-500/20">
                                ⚠️ {risk.warning}
                            </p>
                        )}
                    </div>
                )}

                {/* Trigger Price (Stop Loss) */}
                {orderType === 'STOP_LOSS' && (
                    <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Trigger Price</label>
                        <div className="bg-gray-800/50 rounded-xl p-3 flex items-center border border-gray-700 focus-within:border-blue-500 transition-all shadow-inner">
                            <span className="text-gray-500 font-bold mr-2">₹</span>
                            <input
                                type="number"
                                value={triggerPrice}
                                onChange={(e) => setTriggerPrice(e.target.value)}
                                className="w-full bg-transparent border-none text-right text-white font-mono text-lg font-black focus:ring-0 p-0"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Message Notification */}
            {message && (
                <div className={`p-2 rounded text-center text-xs font-bold animate-in fade-in zoom-in ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Action Button */}
            <div className="mt-auto pt-4">
                <button
                    onClick={handleTrade}
                    disabled={loading}
                    className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${side === 'BUY' ? 'bg-green-600 hover:bg-green-500 shadow-green-900/20' : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Processing...' : `${side} ${ticker}`}
                </button>
            </div>
        </Card>
    );
};

export default OrderForm;
