import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Brain, TrendingUp, TrendingDown, Minus, Info, Zap } from 'lucide-react';

const AISignal = ({ ticker, full = false }) => {
    const [signal, setSignal] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchSignal = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/market/strategy/${ticker}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setSignal(res.data);
            } catch (err) {
                console.error("Signal fetch failed:", err);
                setSignal(null);
            } finally {
                setLoading(false);
            }
        };

        if (ticker) {
            fetchSignal();
            const interval = setInterval(fetchSignal, 10000); // Update every 10s
            return () => clearInterval(interval);
        }
    }, [ticker, user.token]);

    if (loading && !signal) {
        return (
            <div className={`p-4 bg-gray-900/50 rounded-xl border border-gray-800 animate-pulse ${full ? 'h-full flex items-center justify-center' : ''}`}>
                <div className="flex flex-col items-center gap-2">
                    <Brain className="text-gray-800 animate-spin" size={full ? 48 : 24} />
                    <div className="h-4 w-24 bg-gray-800 rounded mb-2"></div>
                </div>
            </div>
        );
    }

    if (!signal) return null;

    const getSignalColor = (s) => {
        switch (s) {
            case 'BUY': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'SELL': return 'text-pink-500 bg-pink-500/10 border-pink-500/20';
            default: return 'text-gray-400 bg-gray-800/50 border-gray-700/50';
        }
    };

    const getSignalIcon = (s) => {
        switch (s) {
            case 'BUY': return <TrendingUp size={full ? 32 : 20} />;
            case 'SELL': return <TrendingDown size={full ? 32 : 20} />;
            default: return <Minus size={full ? 32 : 20} />;
        }
    };

    if (full) {
        return (
            <div className="h-full flex flex-col bg-gray-950/50 backdrop-blur-md">
                <div className="p-8 flex flex-col items-center text-center border-b border-gray-800/50 bg-gradient-to-b from-blue-600/5 to-transparent">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                        <Brain size={14} />
                        Next-Gen Strategy Engine
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center border-2 shadow-2xl transition-all duration-700 ${getSignalColor(signal.signal)} ${signal.signal !== 'HOLD' ? 'scale-110' : ''}`}>
                            {getSignalIcon(signal.signal)}
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-white tracking-tight uppercase">
                                {signal.signal === 'HOLD' ? 'Market Neutral' : `${signal.signal} RECOMMENDATION`}
                            </h2>
                            <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-[0.2em]">
                                {signal.ticker} • Live Technical Analysis • Confidence: {signal.signal === 'HOLD' ? 'Consolidating' : 'High'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Primary Indicators */}
                    <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-3xl hover:border-blue-500/30 transition-all group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                                <TrendingUp size={20} />
                            </div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Price Forecast</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] text-gray-500 font-bold uppercase">Predicted Target</span>
                                <div className="text-3xl font-mono text-blue-400">₹{signal.predicted}</div>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                ML Linear Regression model ($y = mx + b$) identifies a short-term trend path based on the last 50 data clusters.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-3xl hover:border-blue-500/30 transition-all group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-purple-600/10 flex items-center justify-center text-purple-500">
                                <Zap size={20} />
                            </div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Momentum (RSI)</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] text-gray-500 font-bold uppercase">Relative Strength Index</span>
                                <div className={`text-3xl font-mono ${parseFloat(signal.rsi) < 40 ? 'text-green-500' : parseFloat(signal.rsi) > 60 ? 'text-pink-500' : 'text-gray-300'}`}>
                                    {signal.rsi}
                                </div>
                            </div>
                            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${parseFloat(signal.rsi) < 40 ? 'bg-green-500' : parseFloat(signal.rsi) > 60 ? 'bg-pink-500' : 'bg-blue-500'}`}
                                    style={{ width: `${signal.rsi}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-3xl md:col-span-2 lg:col-span-1 hover:border-blue-500/30 transition-all group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-yellow-600/10 flex items-center justify-center text-yellow-500">
                                <Info size={20} />
                            </div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Strategic Reasoning</h3>
                        </div>
                        <div className="flex flex-col gap-3">
                            {signal.reasons?.map((r, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-800/30 border border-gray-700/30">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                    <span className="text-xs text-gray-300 font-medium">{r}</span>
                                </div>
                            ))}
                            {(!signal.reasons || signal.reasons.length === 0) && (
                                <p className="text-xs text-gray-500 italic">Market is currently in tight consolidation range.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-blue-600/5 border-t border-gray-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Brain size={24} className="text-blue-500/50" />
                        <div className="text-[10px] text-gray-600 max-w-xl font-medium">
                            The Algorithmic Strategy Engine utilizes real-time price feeds, recursive EMA computations, and multi-factor weighted scoring to generate these signals. Always remember that past performance does not guarantee future results.
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default sidebar mini-version
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg">
            <div className="p-3 border-b border-gray-800 bg-gray-900/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Brain size={16} className="text-blue-500" />
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI Strategy Advisor</h2>
                </div>
                {signal.signal !== 'HOLD' && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSignalColor(signal.signal)}`}>
                        {signal.signal}
                    </span>
                )}
            </div>

            <div className="p-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${getSignalColor(signal.signal)} transition-all duration-500`}>
                            {getSignalIcon(signal.signal)}
                        </div>
                        <div>
                            <div className={`text-lg font-bold text-white capitalize ${signal.signal === 'HOLD' ? 'opacity-50' : 'animate-pulse'}`}>
                                {signal.signal === 'HOLD' ? 'Neutral' : `${signal.signal} Signal`}
                            </div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
                                {signal.signal === 'HOLD' ? 'Waiting for trend confirmation' : 'High Confidence Strategy'}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="bg-gray-800/40 border border-gray-700/30 rounded-lg p-2">
                            <div className="text-[10px] text-gray-500 uppercase font-bold">Target (ML)</div>
                            <div className="text-sm font-mono text-blue-400">₹{signal.predicted || '---'}</div>
                        </div>
                        <div className="bg-gray-800/40 border border-gray-700/30 rounded-lg p-2">
                            <div className="text-[10px] text-gray-500 uppercase font-bold">RSI (14)</div>
                            <div className={`text-sm font-mono ${parseFloat(signal.rsi) < 35 ? 'text-green-400' : parseFloat(signal.rsi) > 65 ? 'text-pink-400' : 'text-gray-300'}`}>
                                {signal.rsi || '---'}
                            </div>
                        </div>
                    </div>

                    <div className="mt-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <Info size={12} className="text-blue-500" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Market Logic</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {signal.reasons?.map((r, i) => (
                                <span key={i} className="px-2 py-1 rounded text-[9px] bg-gray-800 text-gray-400 border border-gray-700 leading-none">
                                    {r}
                                </span>
                            ))}
                            {(!signal.reasons || signal.reasons.length === 0) && (
                                <span className="px-2 py-1 rounded text-[9px] bg-gray-800 text-gray-500 border border-gray-700 italic">
                                    Consolidating...
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 py-2 bg-blue-600/5 border-t border-gray-800">
                <p className="text-[9px] text-gray-600 font-medium leading-tight">
                    * AI signals are experimental and based on technical analysis patterns. Trading involves risk.
                </p>
            </div>
        </div>
    );
};

export default AISignal;
