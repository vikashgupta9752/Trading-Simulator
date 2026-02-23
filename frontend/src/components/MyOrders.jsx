import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import socket from '../socket';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { XCircle } from 'lucide-react';

const MyOrders = ({ refreshTrigger }) => {
    const [orders, setOrders] = useState([]);
    const { user } = useContext(AuthContext);

    const fetchOrders = async () => {
        if (!user) return;
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/orders/my`, config);
            setOrders(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCancel = async (orderId) => {
        if (!confirm('Are you sure you want to cancel this order?')) return;
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            await axios.delete(`${import.meta.env.VITE_API_URL}/orders/${orderId}`, config);
            fetchOrders();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to cancel order');
        }
    };

    useEffect(() => {
        if (user) {
            fetchOrders();
            socket.on('tradeUpdate', fetchOrders);
            return () => socket.off('tradeUpdate', fetchOrders);
        }
    }, [user, refreshTrigger]);

    return (
        <div className="h-full flex flex-col">
            <div className="sticky top-0 bg-gray-900/90 backdrop-blur pb-2 z-10 border-b border-gray-800">
                <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Open Orders</h3>
            </div>
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left">
                    <thead className="text-xs text-gray-500 font-medium bg-gray-900 sticky top-0">
                        <tr>
                            <th className="py-2">Ticker</th>
                            <th className="py-2">Side</th>
                            <th className="py-2 text-right">Price</th>
                            <th className="py-2 text-right">Qty</th>
                            <th className="py-2 text-right">Status</th>
                            <th className="py-2 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-800">
                        {orders.length === 0 ? (
                            <tr><td colSpan="6" className="py-8 text-center text-gray-600">No active orders</td></tr>
                        ) : (
                            orders.map((order) => {
                                const isBuy = order.type.includes('BUY');
                                return (
                                    <tr key={order._id} className="hover:bg-gray-800/30">
                                        <td className="py-2 font-bold text-white">{order.ticker}</td>
                                        <td className="py-2">
                                            <span className={`text-xs font-bold ${isBuy ? 'text-green-400' : 'text-red-400'}`}>
                                                {isBuy ? 'BUY' : 'SELL'}
                                            </span>
                                        </td>
                                        <td className="py-2 text-right font-mono text-gray-300">{order.price || 'MKT'}</td>
                                        <td className="py-2 text-right font-mono text-gray-300">{order.quantity}</td>
                                        <td className="py-2 text-right">
                                            <Badge variant={order.status === 'FILLED' ? 'neutral' : order.status === 'CANCELLED' ? 'danger' : 'blue'}>
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="py-2 text-right">
                                            {(order.status === 'OPEN' || order.status === 'PARTIAL') && (
                                                <button
                                                    onClick={() => handleCancel(order._id)}
                                                    className="text-gray-600 hover:text-red-400 transition-colors"
                                                    title="Cancel Order"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyOrders;
