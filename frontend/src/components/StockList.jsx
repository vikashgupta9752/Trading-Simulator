import React, { useState, useEffect } from 'react';
import axios from 'axios';
import socket from '../socket';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import Card from './ui/Card';
import Button from './ui/Button';
import { Plus, TrendingUp, TrendingDown, Search as SearchIcon } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const dummyChartData = [
    { value: 100 }, { value: 120 }, { value: 110 }, { value: 140 }, { value: 130 }, { value: 160 }, { value: 180 }
];

const StockItem = ({ ticker, name, price, change, percentChange, isPositive, onSelect, isSelected }) => {
    return (
        <div
            onClick={() => onSelect(ticker)}
            className={`flex items-center gap-2 p-3 border-b border-gray-800 last:border-0 hover:bg-gray-800/50 cursor-pointer transition-colors w-full overflow-hidden ${isSelected ? 'bg-groww-primary/10 border-l-2 border-l-groww-primary' : ''}`}
        >
            {/* Logo/Icon */}
            <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-400">
                {ticker.substring(0, 2)}
            </div>

            {/* Ticker & Name */}
            <div className="flex-1 min-w-0 overflow-hidden leading-tight">
                <h4 className="font-bold text-sm text-white truncate" title={ticker}>{ticker}</h4>
                <p className="text-[10px] text-gray-500 truncate" title={name}>{name}</p>
            </div>

            {/* Sparkline (Desktop Only) */}
            <div className="h-6 w-12 hidden 2xl:block flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dummyChartData}>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={isPositive ? "#22D3EE" : "#F472B6"}
                            strokeWidth={1}
                            fill="none"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Price & Change - Stacked */}
            <div className="text-right flex-shrink-0 min-w-[70px]">
                <div className="text-sm font-bold text-white">₹{price}</div>
                <div className={`text-[10px] font-semibold ${isPositive ? 'text-groww-green' : 'text-groww-red'}`}>
                    {isPositive ? '+' : ''}{change} ({percentChange}%)
                </div>
            </div>

            {/* Compact Action Button */}
            <button
                className="hidden sm:flex items-center justify-center w-6 h-6 rounded-full bg-gray-800 text-gray-500 hover:text-white hover:bg-groww-primary/20 transition-colors flex-shrink-0"
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(ticker);
                }}
            >
                <Plus size={14} />
            </button>
        </div>
    );
};

const StockList = ({ tickers, selectedTicker, onSelectTicker, searchQuery, onUniversalSearch, isSearching }) => {
    const [marketData, setMarketData] = useState({});
    const { user } = useAuth(); // Get user

    useEffect(() => {
        const fetchMarketData = async () => {
            if (!user?.token) return; // Wait for token
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/market/status`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const dataMap = {};
                res.data.forEach(item => {
                    dataMap[item.ticker] = item;
                });
                setMarketData(dataMap);
            } catch (err) {
                console.error("Failed to fetch market data", err);
            }
        };

        fetchMarketData();

        const handleTradeUpdate = (trade) => {
            setMarketData(prev => {
                const prevData = prev[trade.ticker] || {};
                return {
                    ...prev,
                    [trade.ticker]: {
                        ...prevData,
                        ticker: trade.ticker,
                        price: trade.price.toFixed(2),
                    }
                };
            });
        };

        socket.on('tradeUpdate', handleTradeUpdate);
        return () => socket.off('tradeUpdate', handleTradeUpdate);
    }, [user?.token]);

    return (
        <div className="h-full overflow-y-auto pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {tickers.length > 0 ? (
                tickers.map(ticker => {
                    const data = marketData[ticker] || { price: 'Loading...', name: ticker, change: '0.00', pct: '0.00' };
                    const isPositive = !String(data.change).startsWith('-');

                    return (
                        <StockItem
                            key={ticker}
                            ticker={ticker}
                            name={data.name}
                            price={data.price}
                            change={data.change}
                            percentChange={data.pct}
                            isPositive={isPositive}
                            onSelect={onSelectTicker}
                            isSelected={selectedTicker === ticker}
                        />
                    );
                })
            ) : searchQuery && (
                <div className="p-8 text-center">
                    <div className="text-gray-500 mb-4 text-sm italic">No stocks found in your watch list matching "{searchQuery}"</div>
                    <Button
                        onClick={() => onUniversalSearch(searchQuery)}
                        disabled={isSearching}
                        className="w-full bg-groww-primary text-white font-bold py-2 rounded-lg shadow-lg hover:shadow-groww-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                        {isSearching ? (
                            <span className="animate-pulse">Searching...</span>
                        ) : (
                            <>
                                <SearchIcon size={16} />
                                <span>Search "{searchQuery.toUpperCase()}" in Market</span>
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Always show search option if query isn't an exact match in current list */}
            {searchQuery && tickers.length > 0 && !tickers.some(t => t.toUpperCase() === searchQuery.toUpperCase()) && (
                <div className="p-3 border-t border-gray-800 bg-gray-900/50">
                    <button
                        onClick={() => onUniversalSearch(searchQuery)}
                        disabled={isSearching}
                        className="w-full py-2 px-4 rounded-lg bg-gray-800 text-gray-300 text-xs font-bold hover:bg-groww-primary/20 hover:text-white border border-gray-700 transition-all flex items-center justify-center gap-2"
                    >
                        {isSearching ? '...' : `Find "${searchQuery.toUpperCase()}" in Market`}
                    </button>
                </div>
            )}
        </div>
    );
};

export default StockList;
