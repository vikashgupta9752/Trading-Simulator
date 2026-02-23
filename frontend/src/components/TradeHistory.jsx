
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import socket from '../socket';
import Card from './ui/Card';
import Badge from './ui/Badge';

const TradeHistory = ({ refreshTrigger }) => {
    const [trades, setTrades] = useState([]);
    const { user } = useContext(AuthContext);

    const fetchTrades = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/orders/trades`, config);
            setTrades(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchTrades();

            const handleTrade = (newTrade) => {
                if (newTrade.buyerId === user._id || newTrade.sellerId === user._id) {
                    setTrades(prevTrades => [newTrade, ...prevTrades]);
                }
            };

            socket.on('tradeUpdate', handleTrade);
            return () => socket.off('tradeUpdate', handleTrade);
        }
    }, [user, refreshTrigger]);

    return (
        <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-gray-800">
                <h3 className="font-bold text-lg text-gray-200">Recent Trades</h3>
            </div>
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                <table className="min-w-full leading-normal">
                    <thead className="bg-gray-800 sticky top-0">
                        <tr>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Ticker</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Qty</th>
                            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {trades.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-5 py-8 text-sm text-center text-gray-500">
                                    No trades found yet.
                                </td>
                            </tr>
                        ) : (
                            trades.map((trade) => {
                                const isBuy = trade.buyerId === user._id;
                                return (
                                    <tr key={trade._id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-5 py-3 text-sm font-medium text-gray-300">{trade.ticker}</td>
                                        <td className="px-5 py-3 text-sm">
                                            <Badge variant={isBuy ? 'success' : 'danger'}>
                                                {isBuy ? 'BUY' : 'SELL'}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-3 text-sm text-right font-mono text-gray-300">₹{trade.price}</td>
                                        <td className="px-5 py-3 text-sm text-right font-mono text-gray-300">{trade.quantity}</td>
                                        <td className="px-5 py-3 text-sm text-right text-gray-500">{new Date(trade.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default TradeHistory;
