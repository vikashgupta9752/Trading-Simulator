import React, { useState, useEffect } from 'react';
import axios from 'axios';
import socket from '../socket';
import Card from './ui/Card';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

const StockCard = ({ ticker, name }) => {
    const [data, setData] = useState([]);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [prevClose, setPrevClose] = useState(0);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Use 1m candles for sparkline
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/market/candles/${ticker}/1m`);
                const history = res.data.map(item => ({ value: item.close }));
                setData(history.slice(-20));
                if (history.length > 0) {
                    setCurrentPrice(history[history.length - 1].value);
                    setPrevClose(history[0].value);
                }
            } catch (err) {
                // console.error("Failed to fetch data for", ticker);
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
        <Card className="hover:scale-[1.02] transition-transform duration-200 cursor-pointer bg-gray-900 border-gray-800 p-0 overflow-hidden group">
            <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg text-white">{ticker}</h3>
                        <p className="text-xs text-gray-500 font-medium">{name || ticker}</p>
                    </div>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        <span>{Math.abs(percentChange).toFixed(2)}%</span>
                    </div>
                </div>

                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-2xl font-bold text-white">₹{Number(currentPrice || 0).toLocaleString()}</div>
                        <div className={`text-xs font-medium mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {isPositive ? '+' : ''}{Number(change || 0).toFixed(2)} Today
                        </div>
                    </div>

                    <div className="h-12 w-24">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id={`gradient-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isPositive ? "#4ade80" : "#f87171"} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={isPositive ? "#4ade80" : "#f87171"} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={isPositive ? "#4ade80" : "#f87171"}
                                    strokeWidth={2}
                                    fill={`url(#gradient-${ticker})`}
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="bg-gray-800/50 px-4 py-3 border-t border-gray-800 flex justify-between items-center group-hover:bg-gray-800 transition-colors">
                <span className="text-xs text-gray-400 flex items-center">
                    <TrendingUp size={12} className="mr-1" /> Market Open
                </span>
                <button className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors">
                    Trade
                </button>
            </div>
        </Card>
    );
};

export default StockCard;
