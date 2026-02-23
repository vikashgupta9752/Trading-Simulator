import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Zap, BarChart3, ArrowRight, Play, Cpu, Lock, LineChart, CheckCircle2, Github, Linkedin, Twitter, X } from 'lucide-react';
import Button from '../components/ui/Button';

const Landing = () => {
    const [activeTab, setActiveTab] = useState('speed');
    const [isDemoOpen, setIsDemoOpen] = useState(false);

    const tabs = [
        { id: 'speed', label: 'Ultra Fast', icon: <Zap size={18} /> },
        { id: 'security', label: 'Secure & Private', icon: <Shield size={18} /> },
        { id: 'analytics', label: 'Advanced Analytics', icon: <BarChart3 size={18} /> }
    ];

    const tabContent = {
        speed: {
            title: "Performance Without Compromise",
            description: "Built with a high-concurrency architecture that handles thousands of orders per second with microsecond execution.",
            features: [
                "AVL Tree-based matching for O(log N) complexity",
                "Sub-millisecond order execution latency",
                "Scalable microservices for trade processing",
                "Real-time price feed via efficient WebSocket streams"
            ],
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
            icon: <Cpu size={80} className="text-yellow-500/20 animate-pulse relative z-10" />,
            image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000"
        },
        security: {
            title: "Bank-Grade Asset Protection",
            description: "Your security is our priority. We employ multi-layer encryption and rigorous access controls.",
            features: [
                "OAuth 2.0 integration with Google and GitHub",
                "JWT-based session management with auto-refresh",
                "Bcrypt-hashed passwords and secure salt storage",
                "Isolated execution environments for user wallets"
            ],
            color: "text-green-500",
            bg: "bg-green-500/10",
            icon: <Lock size={80} className="text-green-500/20 animate-pulse relative z-10" />,
            image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1000"
        },
        analytics: {
            title: "Professional Trading Insights",
            description: "Go beyond simple charts. Access institutional-grade tools to make informed market decisions.",
            features: [
                "Interactive Candlestick charts with custom intervals",
                "Real-time Depth of Market (DOM) order book",
                "Comprehensive Portfolio & Performance tracking",
                "Historical trade logs and detailed P&L analysis"
            ],
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            icon: <LineChart size={80} className="text-blue-500/20 animate-pulse relative z-10" />,
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000"
        }
    };

    return (
        <div className="flex-1 bg-gray-950 overflow-hidden min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 px-4 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl blur-[120px] opacity-20 pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600 rounded-full"></div>
                </div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
                        <Zap size={14} fill="currentColor" />
                        Next-Gen Trading Platform
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight text-left md:text-center">
                        Trade the Future <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600">
                            With Zero Latency
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed text-left md:text-center">
                        Experience lightning-fast order matching, deep liquidity, and institutional-grade security on the world's most advanced retail trading engine.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register">
                            <Button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-lg font-bold shadow-xl shadow-blue-600/20 active:scale-95 transition-all w-full sm:w-auto">
                                Get Started Free <ArrowRight size={20} className="ml-2" />
                            </Button>
                        </Link>
                        <Button
                            onClick={() => setIsDemoOpen(true)}
                            className="px-8 py-4 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-lg font-bold active:scale-95 transition-all w-full sm:w-auto"
                        >
                            <Play size={18} fill="currentColor" className="mr-2" /> Watch Demo
                        </Button>
                    </div>

                    <div className="mt-20 relative max-w-6xl mx-auto group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-[#0a0c10] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px] backdrop-blur-xl">
                            {/* Dashboard Header Mockup */}
                            <div className="h-14 border-b border-gray-800 bg-gray-900/80 flex items-center px-6 justify-between backdrop-blur-md">
                                <div className="flex items-center gap-6">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/40 shadow-[0_0_10px_rgba(234,179,8,0.2)]"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500/40 shadow-[0_0_10px_rgba(34,197,94,0.2)]"></div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700/50">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        LIVE MARKET: NIFTY 50
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-xs font-mono text-gray-500">SESSION: 04:12:05</div>
                                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                                        JD
                                    </div>
                                </div>
                            </div>

                            {/* Dashboard Body Mockup */}
                            <div className="flex-1 flex overflow-hidden">
                                {/* Left Sidebar: Watchlist */}
                                <div className="w-72 border-r border-gray-800 bg-gray-900/30 p-4 flex flex-col gap-1 hidden md:flex">
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">Watchlist</div>
                                    {[
                                        { s: 'RELIANCE', p: '2,945.20', c: '+1.45%', up: true },
                                        { s: 'TCS', p: '4,120.50', c: '-0.20%', up: false },
                                        { s: 'ZOMATO', p: '158.45', c: '+4.20%', up: true },
                                        { s: 'HDFC BANK', p: '1,450.15', c: '+0.80%', up: true },
                                        { s: 'INFY', p: '1,680.00', c: '+2.10%', up: true },
                                    ].map((stock, i) => (
                                        <div key={i} className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${i === 0 ? 'bg-blue-600/10 border border-blue-500/20' : 'hover:bg-gray-800/40'}`}>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-white">{stock.s}</span>
                                                <span className="text-[10px] text-gray-500">NSE</span>
                                            </div>
                                            <div className="text-right flex flex-col">
                                                <span className="text-xs font-mono text-white">₹{stock.p}</span>
                                                <span className={`text-[10px] font-bold ${stock.up ? 'text-green-400' : 'text-pink-400'}`}>{stock.c}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20">
                                        <div className="text-[10px] text-blue-400 font-bold uppercase mb-1">Portfolio Value</div>
                                        <div className="text-lg font-bold text-white">₹12,45,840.00</div>
                                        <div className="text-[10px] text-green-400 font-bold mt-1">+₹24,500.00 (2.4%)</div>
                                    </div>
                                </div>

                                {/* Main Chart Area */}
                                <div className="flex-1 flex flex-col gap-4 p-6 bg-grid-white/[0.01]">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold text-white">RELIANCE</h3>
                                            <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px] font-bold border border-green-500/20">+1.45%</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {['1m', '5m', '15m', '1h', '1D'].map(t => (
                                                <button key={t} className={`w-8 h-8 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all ${t === '15m' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-gray-800/50 text-gray-500 hover:text-white'}`}>{t}</button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Simulated Chart */}
                                    <div className="h-56 relative flex items-end gap-1.5 px-2">
                                        <div className="absolute inset-0 border-b border-gray-800 flex flex-col justify-between py-2 pointer-events-none">
                                            {[1, 2, 3, 4].map(i => <div key={i} className="h-px w-full bg-gray-800/50 border-gray-800/50 border-dashed border-b"></div>)}
                                        </div>
                                        {[45, 52, 48, 65, 58, 80, 72, 95, 88, 110, 102, 125, 115, 135, 128, 150, 142, 160, 152, 175, 165].map((h, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group/bar z-10">
                                                <div className="w-full bg-gray-800/30 rounded-t-sm h-12 flex items-end">
                                                    <div className="w-full bg-gray-700/50 rounded-t-sm" style={{ height: `${(h % 30) + 10}%` }}></div>
                                                </div>
                                                <div
                                                    className={`w-full rounded-sm transition-all duration-700 hover:brightness-125 ${i > 12 ? 'bg-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]'}`}
                                                    style={{ height: `${h / 2}px`, animationDelay: `${i * 30}ms` }}
                                                ></div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Positions Area */}
                                    <div className="flex-1 bg-gray-900/40 rounded-2xl border border-gray-800/50 p-5 mt-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Positions</span>
                                            <span className="text-[10px] text-blue-500 font-bold hover:underline cursor-pointer">View All</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-xs">
                                                <div className="flex gap-4">
                                                    <span className="text-white font-medium">RELIANCE</span>
                                                    <span className="text-gray-500">140 Qty</span>
                                                </div>
                                                <span className="text-green-400 font-mono">+₹12,450.00</span>
                                            </div>
                                            <div className="h-px bg-gray-800/50"></div>
                                            <div className="flex justify-between items-center text-xs">
                                                <div className="flex gap-4">
                                                    <span className="text-white font-medium">ZOMATO</span>
                                                    <span className="text-gray-500">2,500 Qty</span>
                                                </div>
                                                <span className="text-green-400 font-mono">+₹4,120.00</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Sidebar: Depth & Trade */}
                                <div className="w-80 bg-gray-900/40 border-l border-gray-800 p-6 flex flex-col gap-6 hidden lg:flex">
                                    {/* Order Book */}
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Market Depth</div>
                                        <div className="space-y-1">
                                            {[
                                                { p: '2,946.80', q: '1,420', up: false },
                                                { p: '2,946.45', q: '850', up: false },
                                                { p: '2,945.90', q: '3,210', up: false },
                                            ].map((row, i) => (
                                                <div key={i} className="flex justify-between items-center relative h-6 overflow-hidden group">
                                                    <div className="absolute inset-0 bg-red-500/5" style={{ width: `${(row.q.replace(',', '') / 4000) * 100}%`, right: 0 }}></div>
                                                    <span className="text-xs font-mono text-red-500/80 z-10">{row.p}</span>
                                                    <span className="text-xs font-mono text-gray-400 z-10">{row.q}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between px-2 py-2 bg-gray-800/30 rounded-lg my-3 border border-gray-700/30">
                                                <span className="text-sm font-bold text-white">2,945.20</span>
                                                <TrendingUp size={14} className="text-green-500" />
                                            </div>
                                            {[
                                                { p: '2,944.80', q: '2,140', up: true },
                                                { p: '2,944.45', q: '1,120', up: true },
                                                { p: '2,943.90', q: '4,510', up: true },
                                            ].map((row, i) => (
                                                <div key={i} className="flex justify-between items-center relative h-6 overflow-hidden">
                                                    <div className="absolute inset-0 bg-green-500/5" style={{ width: `${(row.q.replace(',', '') / 5000) * 100}%` }}></div>
                                                    <span className="text-xs font-mono text-green-500/80 z-10">{row.p}</span>
                                                    <span className="text-xs font-mono text-gray-400 z-10">{row.q}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Trade Widget */}
                                    <div className="mt-auto p-5 rounded-2xl bg-gray-800/30 border border-gray-700/50">
                                        <div className="flex gap-2 mb-4">
                                            <button className="flex-1 py-2 rounded-xl bg-green-600 text-[10px] font-bold text-white shadow-lg shadow-green-600/20 active:scale-95 transition-all uppercase">Buy</button>
                                            <button className="flex-1 py-2 rounded-xl bg-gray-700 text-[10px] font-bold text-gray-400 hover:text-white active:scale-95 transition-all uppercase">Sell</button>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] text-gray-500 font-bold uppercase">Quantity</label>
                                                <input readOnly value="140" className="bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-xs text-white font-mono focus:outline-none" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] text-gray-500 font-bold uppercase">Limit Price</label>
                                                <input readOnly value="2,945.20" className="bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-xs text-white font-mono focus:outline-none" />
                                            </div>
                                            <button className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white mt-2 shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                                                PLACE ORDER
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Live Market Section */}
            <section className="py-24 border-y border-gray-900 bg-[#0a0c10] overflow-hidden relative">
                <div className="absolute inset-0 bg-blue-600/5 blur-[120px] pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-4 mb-16 relative z-10">
                    <div className="flex items-end justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] mb-4">
                                <span className="w-8 h-px bg-blue-500/50 text-blue-500">—</span> Realtime Market Feed
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">Market Pulse</h2>
                            <p className="text-gray-500 text-lg">Lightning fast data mirrored from global stock exchanges</p>
                        </div>
                        <Link to="/register" className="hidden sm:flex items-center gap-3 px-6 py-3 rounded-full bg-gray-900 border border-gray-800 text-white font-bold hover:bg-gray-800 hover:border-gray-700 transition-all group">
                            Full Market View <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                <div className="flex gap-6 px-4 animate-scroll-x hover:pause-animation">
                    {[
                        { name: 'RELIANCE', price: '2,945.20', change: '+1.45%', up: true, trend: [20, 30, 25, 45, 40, 60] },
                        { name: 'TCS', price: '4,120.50', change: '-0.20%', up: false, trend: [60, 50, 55, 40, 45, 30] },
                        { name: 'HDFC BANK', price: '1,450.15', change: '+0.80%', up: true, trend: [30, 35, 32, 48, 45, 50] },
                        { name: 'INFY', price: '1,680.00', change: '+2.10%', up: true, trend: [40, 50, 45, 70, 65, 90] },
                        { name: 'ZOMATO', price: '158.45', change: '+4.20%', up: true, trend: [10, 20, 15, 40, 35, 80] },
                        { name: 'TATA MOTORS', price: '920.40', change: '-1.25%', up: false, trend: [80, 70, 75, 50, 55, 40] },
                        { name: 'SBI', price: '760.30', change: '+0.45%', up: true, trend: [20, 25, 22, 38, 35, 40] },
                        { name: 'ADANI ENT', price: '3,140.00', change: '+3.15%', up: true, trend: [30, 45, 40, 80, 75, 110] },
                    ].concat([
                        { name: 'RELIANCE', price: '2,945.20', change: '+1.45%', up: true, trend: [20, 30, 25, 45, 40, 60] },
                        { name: 'TCS', price: '4,120.50', change: '-0.20%', up: false, trend: [60, 50, 55, 40, 45, 30] },
                        { name: 'HDFC BANK', price: '1,450.15', change: '+0.80%', up: true, trend: [30, 35, 32, 48, 45, 50] },
                        { name: 'INFY', price: '1,680.00', change: '+2.10%', up: true, trend: [40, 50, 45, 70, 65, 90] },
                    ]).map((stock, i) => (
                        <div key={i} className="flex-shrink-0 w-72 p-8 rounded-[2rem] bg-gray-900/40 border border-gray-800 hover:border-blue-500/50 transition-all cursor-pointer group hover:bg-gray-900 backdrop-blur-sm">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="text-sm font-black text-gray-500 group-hover:text-blue-400 transition-colors uppercase tracking-widest">{stock.name}</div>
                                    <div className="text-[10px] text-gray-600 font-bold uppercase">NSE India</div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black ${stock.up ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'}`}>
                                    {stock.change}
                                </div>
                            </div>
                            <div className="flex items-end justify-between gap-4">
                                <div className="text-3xl font-black text-white tracking-tighter">₹{stock.price}</div>
                                <div className="flex items-end gap-1 h-12 w-20">
                                    {stock.trend.map((h, j) => (
                                        <div
                                            key={j}
                                            className={`flex-1 rounded-full transition-all duration-1000 ${stock.up ? 'bg-green-500/30' : 'bg-pink-500/30'}`}
                                            style={{ height: `${h}%` }}
                                        ></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Interactive Features Section */}
            <section className="py-24 bg-gray-950 scroll-mt-20" id="features">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Powerful Features</h2>
                        <p className="text-gray-400">Select a feature to explore its technical core</p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 ring-2 ring-blue-500/50'
                                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-gray-900/20 border border-gray-800 p-8 md:p-12 rounded-[2rem] min-h-[400px]">
                        <div className="text-left">
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${tabContent[activeTab].bg} ${tabContent[activeTab].color} mb-6`}>
                                {tabs.find(t => t.id === activeTab).icon}
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-4">{tabContent[activeTab].title}</h3>
                            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                                {tabContent[activeTab].description}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {tabContent[activeTab].features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <CheckCircle2 size={18} className={`${tabContent[activeTab].color} mt-1 flex-shrink-0`} />
                                        <span className="text-gray-300 text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Feature Visual */}
                        <div className="relative group w-full">
                            <div className={`absolute -inset-4 rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-opacity ${tabContent[activeTab].bg}`}></div>
                            <div className="relative aspect-video w-full bg-gray-900/50 border border-gray-800 rounded-3xl flex items-center justify-center overflow-hidden">
                                <img
                                    src={tabContent[activeTab].image}
                                    alt={tabContent[activeTab].title}
                                    className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-950/80 via-transparent to-gray-950/80"></div>

                                {tabContent[activeTab].icon}

                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-3/4 h-3/4 border border-dashed border-gray-700/30 rounded-full animate-spin-slow"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Performance Stats Section */}
            <section className="py-24 bg-gray-950 px-4">
                <div className="max-w-7xl mx-auto border border-gray-800 rounded-[3rem] bg-gradient-to-b from-gray-900/50 to-transparent p-12 md:p-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div>
                            <div className="text-5xl font-extrabold text-white mb-2">1M+</div>
                            <div className="text-blue-500 font-bold uppercase tracking-widest text-sm">Trades Processed</div>
                        </div>
                        <div>
                            <div className="text-5xl font-extrabold text-white mb-2">99.9%</div>
                            <div className="text-indigo-500 font-bold uppercase tracking-widest text-sm">Uptime Reliability</div>
                        </div>
                        <div>
                            <div className="text-5xl font-extrabold text-white mb-2">~10ms</div>
                            <div className="text-purple-500 font-bold uppercase tracking-widest text-sm">Average Latency</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 bg-gray-950 border-t border-gray-900 px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
                    <div className="col-span-2 lg:col-span-2">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex gap-4">
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-blue-600 transition-all group">
                                    <Github className="text-gray-400 group-hover:text-white" size={20} />
                                </a>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-blue-600 transition-all group">
                                    <Linkedin className="text-gray-400 group-hover:text-white" size={20} />
                                </a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-blue-600 transition-all group">
                                    <Twitter className="text-gray-400 group-hover:text-white" size={20} />
                                </a>
                            </div>
                        </div>
                        <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
                            Pro-grade trading infrastructure built on high-performance DSA algorithms. Experience the next level of financial engineering.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Platform</h4>
                        <ul className="space-y-4 text-gray-500 text-sm">
                            <li className="hover:text-blue-500 transition-colors cursor-pointer">Markets</li>
                            <li className="hover:text-blue-500 transition-colors cursor-pointer">Trade</li>
                            <li className="hover:text-blue-500 transition-colors cursor-pointer">Portfolio</li>
                            <li className="hover:text-blue-500 transition-colors cursor-pointer">Watchlist</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Resources</h4>
                        <ul className="space-y-4 text-gray-500 text-sm">
                            <li className="hover:text-blue-500 transition-colors cursor-pointer">API Docs</li>
                            <li className="hover:text-blue-500 transition-colors cursor-pointer">Matching Engine</li>
                            <li className="hover:text-blue-500 transition-colors cursor-pointer">Legal</li>
                            <li className="hover:text-blue-500 transition-colors cursor-pointer">Security</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Connect</h4>
                        <ul className="space-y-4 text-gray-500 text-sm">
                            <li className="hover:text-blue-500 transition-colors pointer-events-none">Developer Profiles</li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-600 text-xs">
                    <div>© 2026 Developed by User. All rights reserved.</div>
                    <div className="flex gap-8">
                        <span className="hover:text-gray-400 transition-colors cursor-pointer">Privacy Policy</span>
                        <span className="hover:text-gray-400 transition-colors cursor-pointer">Terms of Service</span>
                        <span className="hover:text-gray-400 transition-colors cursor-pointer">Cookie Settings</span>
                    </div>
                </div>
            </footer>

            {/* Watch Demo Modal */}
            {isDemoOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-950/80 backdrop-blur-xl transition-opacity duration-300"
                        onClick={() => setIsDemoOpen(false)}
                    ></div>
                    <div className="relative w-full max-w-4xl aspect-[16/10] bg-[#0a0c10] border border-gray-800 rounded-[2.5rem] shadow-[0_0_100px_rgba(59,130,246,0.15)] overflow-hidden duration-300">
                        {/* Modal Header */}
                        <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-8 bg-gradient-to-b from-gray-900/50 to-transparent z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                                    <Play size={14} className="text-blue-500" fill="currentColor" />
                                </div>
                                <span className="text-sm font-bold text-white tracking-tight">Antigravity Platform Walkthrough</span>
                                <span className="px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">4K • HDR</span>
                            </div>
                            <button
                                onClick={() => setIsDemoOpen(false)}
                                className="w-10 h-10 rounded-full bg-gray-900/50 border border-gray-800 flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 transition-all active:scale-90"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Player Content */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black">
                            {/* Loading State */}
                            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0c10] z-0">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                                    <span className="text-xs font-bold text-gray-500 animate-pulse uppercase tracking-widest">Initialising Stream...</span>
                                </div>
                            </div>

                            <video
                                className="w-full h-full object-cover relative z-10"
                                autoPlay
                                muted
                                loop
                                playsInline
                            >
                                <source src="/demo.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>

                            {/* Floating UI Overlays for Realism (Z-index 20) */}
                            <div className="absolute inset-0 pointer-events-none z-20">
                                <div className="absolute top-1/4 left-1/4 p-3 rounded-2xl bg-gray-950/80 border border-gray-800 backdrop-blur-md shadow-2xl animate-bounce">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp size={16} className="text-green-500" />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Live Order Matching</span>
                                    </div>
                                </div>

                                <div className="absolute bottom-1/4 right-1/4 p-3 rounded-2xl bg-gray-950/80 border border-gray-800 backdrop-blur-md shadow-2xl animate-pulse" style={{ animationDelay: '1s' }}>
                                    <div className="flex items-center gap-2">
                                        <Shield size={16} className="text-blue-500" />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Secure Trading Node</span>
                                    </div>
                                </div>

                                {/* Mock Playbar (Purely Visual now) */}
                                <div className="absolute bottom-10 left-10 right-10 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="h-1.5 w-full bg-gray-800/50 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 w-[72%]"></div>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                                        <span>PRO STREAM ENABLED</span>
                                        <div className="flex gap-4">
                                            <span>LIVE</span>
                                            <span>4K ULTRA HD</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Landing;
