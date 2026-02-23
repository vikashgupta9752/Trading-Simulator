import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StockCard from '../components/StockCard';
import { Search } from 'lucide-react';

const Explore = () => {
    const [stocks, setStocks] = useState([]);
    const [search, setSearch] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/market/status`, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
                setStocks(data);
            } catch (err) {
                // console.error(err);
            }
        };
        fetchMarketData();
    }, [user]);

    const filteredStocks = stocks.filter(stock =>
        stock.ticker.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="bg-gray-900/50 p-8 rounded-3xl border border-gray-800 backdrop-blur-md shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] pointer-events-none"></div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight mb-2">Explore <span className="text-blue-500">Market</span></h1>
                        <p className="text-gray-400 font-medium">Discover trending stocks, indices, and global assets</p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search assets..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-gray-950/50 text-white pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-800 w-full md:w-64 transition-all focus:md:w-80 shadow-inner"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {['All Assets', 'Trending', 'NIFTY 50', 'IT Sector', 'Banking', 'Energy'].map(cat => (
                        <button key={cat} className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${cat === 'All Assets' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-gray-800/50 text-gray-400 hover:text-white border border-gray-700/50'}`}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStocks.map(stock => (
                    <StockCard key={stock.ticker} ticker={stock.ticker} name={stock.name || stock.ticker} />
                ))}
            </div>

            {filteredStocks.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    No stocks found matching "{search}"
                </div>
            )}
        </div>
    );
};

export default Explore;
