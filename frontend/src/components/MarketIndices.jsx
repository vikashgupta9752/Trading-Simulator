import React, { useState, useEffect } from 'react';
import axios from 'axios';
import socket from '../socket';
import { useAuth } from '../context/AuthContext';
import Card from './ui/Card';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const IndexCard = ({ name, ticker }) => {
    const [data, setData] = useState([]);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [prevClose, setPrevClose] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user?.token) return;
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/market/candles/${ticker}/1m`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const history = res.data.map(item => ({ value: item.close }));
                setData(history.slice(-20)); // Keep last 20 points for sparkline
                if (history.length > 0) {
                    setCurrentPrice(history[history.length - 1].value);
                    setPrevClose(history[0].value);
                }
            } catch (err) {
                // console.error("Failed to fetch index data", err);
            }
        };

        fetchHistory();

        const handleUpdate = (update) => {
            if (update.ticker === ticker && update.interval === '1m') {
                const price = update.candle.close;
                setCurrentPrice(price);
                setData(prev => {
                    const newData = [...prev, { value: price }];
                    return newData.slice(-20);
                });
            }
        };

        socket.on('candleUpdate', handleUpdate);
        return () => socket.off('candleUpdate', handleUpdate);
    }, [ticker]);

    const change = currentPrice - prevClose;
    const percentChange = prevClose ? ((change / prevClose) * 100) : 0;
    const isPositive = change >= 0;

    return (
        <Card className="flex-shrink-0 min-w-[280px] p-4 cursor-pointer hover:bg-gray-800 transition-all border border-gray-800 bg-[#0B1221] shadow-lg">
            <div className="flex justify-between items-end h-full">
                <div>
                    <h3 className="text-gray-400 font-bold text-xs tracking-wider uppercase mb-2">{name}</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="font-bold text-xl text-white">₹{currentPrice.toLocaleString()}</span>
                        <span className={`text-xs font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? '+' : ''}{change.toFixed(2)} ({Math.abs(percentChange).toFixed(2)}%)
                        </span>
                    </div>
                </div>
                <div className="h-12 w-24">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id={`color${ticker}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isPositive ? "#4ade80" : "#f87171"} stopOpacity={0.1} />
                                    <stop offset="95%" stopColor={isPositive ? "#4ade80" : "#f87171"} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={isPositive ? "#4ade80" : "#f87171"}
                                strokeWidth={2}
                                fillOpacity={1}
                                fill={`url(#color${ticker})`}
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
};

const MarketIndices = () => {
    const indices = [
        { name: "NIFTY 50", ticker: "NIFTY50" },
        { name: "BANK NIFTY", ticker: "BANKNIFTY" },
        { name: "SENSEX", ticker: "SENSEX" },
        { name: "MIDCAP 50", ticker: "MIDCAP" },
        { name: "NIFTY IT", ticker: "IT" },
        { name: "NIFTY AUTO", ticker: "AUTO" },
        { name: "FIN NIFTY", ticker: "FINNIFTY" },
        { name: "NIFTY PHARMA", ticker: "PHARMA" },
    ];

    return (
        <div className="w-full overflow-x-auto no-scrollbar flex items-center h-full bg-gray-950/50 border-b border-gray-900 px-2 gap-2">
            {indices.map((idx, i) => (
                <IndexCard key={i} {...idx} />
            ))}
        </div>
    );
};

export default MarketIndices;
