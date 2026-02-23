
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import Card from './ui/Card';

const AnalyticsDashboard = ({ ticker = 'TCS' }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/analytics/candles/${ticker}`);
            const formattedData = res.data.map(item => ({
                time: new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                price: item.close,
                volume: item.volume
            }));
            setData(formattedData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [ticker]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 p-3 border border-gray-700 shadow-lg rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">{label}</p>
                    <p className="text-sm font-bold text-white">₹{payload[0].value}</p>
                    <p className="text-xs text-groww-green">
                        Vol: {payload[0].payload.volume}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white">{ticker}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                        <span className="text-2xl font-bold text-white">₹{data.length > 0 ? data[data.length - 1].price : '0.00'}</span>
                        <span className="text-sm font-medium text-groww-green">+1.2% (Today)</span>
                    </div>
                </div>
                <div className="flex space-x-2">
                    {['1D', '1W', '1M', '1Y'].map(range => (
                        <button key={range} className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${range === '1D' ? 'bg-groww-green/20 text-groww-green' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="h-[300px] flex items-center justify-center text-gray-400">Loading Chart...</div>
            ) : (
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                            <XAxis
                                dataKey="time"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                minTickGap={30}
                            />
                            <YAxis
                                domain={['auto', 'auto']}
                                orientation="right"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke="#22D3EE"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorPrice)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </Card>
    );
};

export default AnalyticsDashboard;
