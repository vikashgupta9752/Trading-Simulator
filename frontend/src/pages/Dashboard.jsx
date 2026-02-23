import { useState, useEffect } from 'react';
import OrderForm from '../components/OrderForm';
import OrderBook from '../components/OrderBook';
import TradeHistory from '../components/TradeHistory';
import MyOrders from '../components/MyOrders';
import StockChart from '../components/StockChart';
import Portfolio from '../components/Portfolio';
import StockList from '../components/StockList';
import MarketIndices from '../components/MarketIndices';
import WalletModal from '../components/WalletModal';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

import MarketNews from '../components/MarketNews';
import AISignal from '../components/AISignal';
import AIPulse from '../components/AIPulse';
import { useSearch } from '../context/SearchContext';
import { Brain } from 'lucide-react';

const Dashboard = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [extraTickers, setExtraTickers] = useState([]);
    const [searching, setSearching] = useState(false);
    const [ticker, setTicker] = useState('TCS');
    const [activeTab, setActiveTab] = useState('orders');
    const [isWalletOpen, setIsWalletOpen] = useState(false);
    const { user } = useAuth();
    const [balance, setBalance] = useState(user?.balance || 0);
    const { searchQuery, setSearchQuery, submitTrigger } = useSearch();

    // Auto-select or search when a global search event is triggered (e.g., Enter in Navbar)
    useEffect(() => {
        if (submitTrigger === 0 || !searchQuery) return;

        const symbol = searchQuery.trim().toUpperCase();
        // Check if it's already in the available list
        if (availableTickers.includes(symbol)) {
            setTicker(symbol);
            setSearchQuery('');
        } else {
            // Try universal search automatically
            handleUniversalSearch(symbol);
        }
    }, [submitTrigger]);

    // Refresh balance when modal closes or updates
    const refreshBalance = async () => {
        if (!user) return;
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/users/me`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setBalance(data.balance);
            // Trigger other updates if needed
            setRefreshTrigger(prev => prev + 1);
        } catch (err) { console.error(err); }
    };

    const allTickers = ['TCS', 'INFY', 'WIPRO', 'RELIANCE', 'HDFCBANK', 'NIFTY50', 'BANKNIFTY'];
    const availableTickers = [...new Set([...allTickers, ...extraTickers])];
    const tickers = availableTickers.filter(t => t.toLowerCase().includes((searchQuery || '').toLowerCase()));

    const handleUniversalSearch = async (query) => {
        const symbol = (query || searchQuery).toUpperCase();
        if (!symbol || symbol.length < 2) return;
        setSearching(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/market/search/${symbol}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (res.data.ticker) {
                const newTicker = res.data.ticker;
                console.log(`[Search] resolved ${symbol} to ${newTicker}`);
                if (!extraTickers.includes(newTicker)) {
                    setExtraTickers(prev => [...prev, newTicker]);
                }
                setTicker(newTicker);
                setSearchQuery(''); // Clear search on success
            }
        } catch (err) {
            alert(`Stock ${symbol} not found in market.`);
        } finally {
            setSearching(false);
        }
    };

    const handleOrderPlaced = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="flex flex-col min-h-screen pb-10">
            {/* Top Bar - Indices */}
            <div className="h-28 flex-shrink-0 mb-4 bg-gray-950 z-30">
                <MarketIndices />
            </div>

            {/* Main Content Area - Refined 3-Column Vertical Fill Layout */}
            <div className="flex-1 max-w-[1920px] mx-auto w-full px-4 grid grid-cols-12 gap-4 pb-8 min-h-[900px]">

                {/* Column 1: Market Hub (3/12) - Stretches to fill */}
                <div className="col-span-3 flex flex-col gap-4">
                    {/* Market Watch */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-3 border-b border-gray-800 bg-gray-900">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Market Watch</h2>
                        </div>
                        <div className="h-[350px] overflow-hidden">
                            <StockList
                                tickers={tickers}
                                selectedTicker={ticker}
                                onSelectTicker={setTicker}
                                searchQuery={searchQuery}
                                onUniversalSearch={handleUniversalSearch}
                                isSearching={searching}
                            />
                        </div>
                    </div>

                    {/* AI Strategy Insights - Fills remaining space */}
                    <div className="flex-1 flex flex-col gap-4">
                        <AISignal ticker={ticker} />
                        <div className="flex-1 min-h-[400px]">
                            <AIPulse ticker={ticker} />
                        </div>
                    </div>
                </div>

                {/* Column 2: Analysis & News (6/12) - The Center Hub */}
                <div className="col-span-6 flex flex-col gap-4">
                    {/* Main Chart */}
                    <div className="h-[450px] bg-gray-900 rounded-xl border border-gray-800 p-1 relative shadow-lg overflow-hidden flex-shrink-0">
                        <StockChart ticker={ticker} />
                    </div>

                    {/* Dynamic Tabs Section */}
                    <div className="bg-gray-900 rounded-xl border border-gray-800 flex flex-col overflow-hidden h-[350px] flex-shrink-0">
                        <div className="flex border-b border-gray-800 flex-shrink-0">
                            <button onClick={() => setActiveTab('orders')} className={`px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'orders' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}>Open Orders</button>
                            <button onClick={() => setActiveTab('trades')} className={`px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'trades' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}>Recent Trades</button>
                            <button onClick={() => setActiveTab('portfolio')} className={`px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'portfolio' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}>Holdings</button>
                            <button onClick={() => setActiveTab('strategy')} className={`px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'strategy' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}>
                                <div className="flex items-center gap-2">
                                    <Brain size={14} />
                                    AI Strategy
                                </div>
                            </button>
                        </div>
                        <div className="p-0 flex-1 overflow-y-auto">
                            {activeTab === 'orders' && <div className="p-4"><MyOrders key={refreshTrigger} /></div>}
                            {activeTab === 'trades' && <div className="p-4"><TradeHistory refreshTrigger={refreshTrigger} /></div>}
                            {activeTab === 'portfolio' && <div className="p-4"><Portfolio refreshTrigger={refreshTrigger} /></div>}
                            {activeTab === 'strategy' && <AISignal ticker={ticker} full={true} />}
                        </div>
                    </div>

                    {/* Market News Section - Stretches To Fill Center Column */}
                    <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden min-h-[300px] shadow-sm">
                        <MarketNews />
                    </div>
                </div>

                {/* Column 3: Trading Desk (3/12) */}
                <div className="col-span-3 flex flex-col gap-4">
                    {/* Wallet/Balance */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 shadow-lg text-white relative overflow-hidden flex-shrink-0">
                        <div className="relative z-10">
                            <span className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">Available Balance</span>
                            <div className="text-3xl font-bold mt-1 mb-4">₹{balance.toLocaleString()}</div>
                            <div className="flex gap-2 text-[11px] font-bold">
                                <button onClick={() => setIsWalletOpen(true)} className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-all backdrop-blur-md">ADD FUNDS</button>
                                <button onClick={() => setIsWalletOpen(true)} className="bg-black/20 hover:bg-black/30 px-3 py-1.5 rounded-lg transition-all backdrop-blur-md">WITHDRAW</button>
                            </div>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    </div>

                    <WalletModal isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} onUpdate={refreshBalance} balance={balance} />

                    {/* Quick Trade Form */}
                    <div className="rounded-xl overflow-hidden shadow-xl border border-gray-800 bg-gray-900 flex-shrink-0">
                        <OrderForm onOrderPlaced={handleOrderPlaced} ticker={ticker} />
                    </div>

                    {/* Market Depth - Stretches to fill right side */}
                    <div className="flex-1 flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden min-h-[300px] shadow-sm">
                        <div className="p-3 border-b border-gray-800 bg-gray-950/30">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Market Depth</h2>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <OrderBook ticker={ticker} refreshTrigger={refreshTrigger} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
