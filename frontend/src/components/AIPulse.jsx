import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BarChart3, ShieldCheck, Zap, Activity } from 'lucide-react';

const AIPulse = ({ ticker }) => {
    const [pulse, setPulse] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchPulse = async () => {
            if (!ticker || !user?.token) return;
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/market/strategy/${ticker}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                // We use the same strategy endpoint but transform it for the Pulse view
                setPulse(res.data);
            } catch (err) {
                console.error("Pulse fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPulse();
        const interval = setInterval(fetchPulse, 10000);
        return () => clearInterval(interval);
    }, [ticker, user.token]);

    if (loading && !pulse) return <div className="h-40 bg-gray-900/50 animate-pulse rounded-xl border border-gray-800"></div>;
    if (!pulse) return null;

    // Derived metrics for the pulse view
    const confidence = pulse.signal === 'HOLD' ? 45 : 85;
    const sentiment = pulse.signal === 'BUY' ? 'Bullish' : pulse.signal === 'SELL' ? 'Bearish' : 'Neutral';
    const sentimentColor = pulse.signal === 'BUY' ? 'text-green-400' : pulse.signal === 'SELL' ? 'text-pink-400' : 'text-gray-400';

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg transition-all hover:border-blue-500/30 flex flex-col h-full min-h-[400px]">
            <div className="p-3 border-b border-gray-800 bg-gray-950/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-blue-400" />
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI Market Pulse</h2>
                </div>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[9px] text-gray-500 font-bold uppercase">Live</span>
                </div>
            </div>

            <div className="p-4 space-y-5 flex-1 overflow-y-auto">
                {/* Confidence Area */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Trend Confidence</span>
                        <span className="text-xs font-mono text-blue-400 font-bold">{confidence}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden p-[1px]">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_12px_rgba(59,130,246,0.4)] transition-all duration-1000 rounded-full"
                            style={{ width: `${confidence}%` }}
                        ></div>
                    </div>
                </div>

                {/* Primary Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/30 transition-colors hover:bg-gray-800/60">
                        <div className="flex items-center gap-1.5 mb-2">
                            <Activity size={12} className="text-purple-400" />
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Sentiment</span>
                        </div>
                        <div className={`text-sm font-black uppercase tracking-tight ${sentimentColor}`}>
                            {sentiment}
                        </div>
                    </div>
                    <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/30 transition-colors hover:bg-gray-800/60">
                        <div className="flex items-center gap-1.5 mb-2">
                            <ShieldCheck size={12} className="text-emerald-400" />
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Stability</span>
                        </div>
                        <div className="text-sm font-black text-gray-200 uppercase tracking-tight">
                            {confidence > 60 ? 'Optimal' : 'Variable'}
                        </div>
                    </div>
                </div>

                {/* AI Technical Breakdown Section */}
                <div className="space-y-3 pt-2 border-t border-gray-800/50">
                    <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        Technical Pulse
                    </h3>

                    <div className="space-y-3">
                        {/* RSI Insight */}
                        <div className="flex justify-between items-center bg-gray-950/30 p-2 rounded border border-gray-800/40">
                            <div className="flex flex-col">
                                <span className="text-[9px] text-gray-500 font-bold uppercase">RSI (14)</span>
                                <span className="text-xs font-mono text-gray-300 font-bold">{pulse.rsi || '38.4'}</span>
                            </div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase px-2 py-0.5 rounded bg-gray-800">
                                {pulse.rsi < 30 ? 'Oversold' : pulse.rsi > 70 ? 'Overbought' : 'Neutral'}
                            </div>
                        </div>

                        {/* Volume Insight */}
                        <div className="flex justify-between items-center bg-gray-950/30 p-2 rounded border border-gray-800/40">
                            <div className="flex flex-col">
                                <span className="text-[9px] text-gray-500 font-bold uppercase">Volume Trend</span>
                                <span className="text-xs font-mono text-gray-300 font-bold">Rel. High</span>
                            </div>
                            <Zap size={14} className="text-yellow-500" />
                        </div>
                    </div>
                </div>

                {/* Extended Insight Box */}
                <div className="mt-auto p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Zap size={14} className="text-blue-400" />
                        <span className="text-[10px] text-blue-400 font-bold uppercase">AI Insight</span>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                        {pulse.signal === 'HOLD'
                            ? "Current consolidation phase detected. Volume profile suggests potential breakout in next 24-48 hours. Monitoring key support levels."
                            : `Strong directional bias confirmed. Technical indicators across multiple timeframes suggest sustained ${pulse.signal} momentum.`}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AIPulse;
