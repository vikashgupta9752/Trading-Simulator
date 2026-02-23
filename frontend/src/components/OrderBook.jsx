
import { useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../socket';
import { useAuth } from '../context/AuthContext';
import Card from './ui/Card';

const OrderBook = ({ ticker, refreshTrigger }) => {
    const { user } = useAuth();
    const [bids, setBids] = useState([]);
    const [asks, setAsks] = useState([]);

    const fetchOrderBook = async () => {
        if (!user?.token) return;
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/orders/book/${ticker}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setBids(data.bids);
            setAsks(data.asks);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchOrderBook();

        const handleUpdate = (data) => {
            if (data.ticker === ticker) {
                setBids(data.bids);
                setAsks(data.asks);
            }
        };

        socket.on('orderBookUpdate', handleUpdate);

        return () => {
            socket.off('orderBookUpdate', handleUpdate);
        };
    }, [ticker, refreshTrigger]);

    return (
        <Card className="h-full flex flex-col bg-transparent border-0 shadow-none">
            <div className="flex justify-between text-xs font-medium text-gray-400 pb-2 border-b border-gray-800 px-2 mt-2">
                <div className="w-1/2 flex justify-between pr-2 border-r border-gray-800">
                    <span>Bid Qty</span>
                    <span>Bid Price</span>
                </div>
                <div className="w-1/2 flex justify-between pl-2">
                    <span>Ask Price</span>
                    <span>Ask Qty</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                <div className="flex">
                    <div className="w-1/2 border-r border-gray-800">
                        {bids.length === 0 ? <p className="text-gray-500 text-xs text-center py-4">No bids</p> :
                            bids.map((bid, index) => (
                                <div key={index} className="flex justify-between items-center py-1.5 px-2 hover:bg-groww-green/5 relative">
                                    <div className="absolute left-0 top-0 bottom-0 bg-groww-green/10 opacity-30" style={{ width: `${Math.min(bid.quantity, 100)}%` }}></div>
                                    <span className="font-mono text-xs text-gray-300 relative z-10">{bid.quantity}</span>
                                    <span className="font-mono text-xs font-medium text-groww-green relative z-10">{bid.price}</span>
                                </div>
                            ))
                        }
                    </div>
                    <div className="w-1/2">
                        {asks.length === 0 ? <p className="text-gray-500 text-xs text-center py-4">No asks</p> :
                            asks.map((ask, index) => (
                                <div key={index} className="flex justify-between items-center py-1.5 px-2 hover:bg-groww-red/5 relative">
                                    <div className="absolute right-0 top-0 bottom-0 bg-groww-red/10 opacity-30" style={{ width: `${Math.min(ask.quantity, 100)}%` }}></div>
                                    <span className="font-mono text-xs font-medium text-groww-red relative z-10">{ask.price}</span>
                                    <span className="font-mono text-xs text-gray-300 relative z-10">{ask.quantity}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default OrderBook;
