import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { ArrowUpRight, ArrowDownRight, Briefcase } from 'lucide-react';
import Card from './ui/Card';

const PortfolioTable = () => {
    const [portfolio, setPortfolio] = useState([]);
    const { user } = useContext(AuthContext);
    const [prices, setPrices] = useState({});

    // Fetch portfolio
    useEffect(() => {
        const fetchPortfolio = async () => {
            if (!user) return;
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/users/me`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setPortfolio(data.portfolio || []);
            } catch (error) {
                console.error("Error fetching portfolio:", error);
            }
        };
        fetchPortfolio();
    }, [user]);

    // Fetch current prices (mock/real mix) or use socket - simpler here: fetch market status
    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/market/status`, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
                // Convert array to map
                const priceMap = {};
                data.forEach(item => {
                    priceMap[item.ticker] = item.price;
                });
                setPrices(priceMap);
            } catch (err) {
                // console.error(err);
            }
        };
        if (user) fetchPrices();
        const interval = setInterval(fetchPrices, 5000); // refresh every 5s
        return () => clearInterval(interval);
    }, [user]);

    const totalInvestment = portfolio.reduce((acc, asset) => acc + (asset.quantity * (asset.averageBuyPrice || 0)), 0);
    const currentValue = portfolio.reduce((acc, asset) => acc + (asset.quantity * (prices[asset.ticker] || 0)), 0);
    const totalPnL = currentValue - totalInvestment;
    const totalPnLPercent = totalInvestment ? (totalPnL / totalInvestment) * 100 : 0;

    return (
        <Card className="bg-gray-900 border-gray-800">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <Briefcase className="mr-2 text-blue-500" /> Your Portfolio
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Track your investments and performance</p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-400">Total Value</div>
                    <div className="text-2xl font-bold text-white">₹{currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    <div className={`text-sm font-bold flex items-center justify-end ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {totalPnL >= 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                        ₹{Math.abs(totalPnL).toFixed(2)} ({Math.abs(totalPnLPercent).toFixed(2)}%)
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="p-4">Ticker</th>
                            <th className="p-4 text-right">Quantity</th>
                            <th className="p-4 text-right">Avg. Buy Price</th>
                            <th className="p-4 text-right">LTP</th>
                            <th className="p-4 text-right">Current Value</th>
                            <th className="p-4 text-right">P&L</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-sm">
                        {portfolio.map((asset) => {
                            const currentPrice = prices[asset.ticker] || 0;
                            const invested = asset.quantity * (asset.averageBuyPrice || 0);
                            const current = asset.quantity * currentPrice;
                            const pnl = current - invested;
                            const pnlPercent = invested ? (pnl / invested) * 100 : 0;
                            const isProfit = pnl >= 0;

                            return (
                                <tr key={asset.ticker} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="p-4 font-bold text-white">{asset.ticker}</td>
                                    <td className="p-4 text-right text-gray-300">{asset.quantity}</td>
                                    <td className="p-4 text-right text-gray-300">₹{Number(asset.averageBuyPrice || 0).toFixed(2)}</td>
                                    <td className="p-4 text-right text-white font-medium">₹{Number(currentPrice || 0).toFixed(2)}</td>
                                    <td className="p-4 text-right text-white font-medium">₹{current.toLocaleString()}</td>
                                    <td className={`p-4 text-right font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                                        <div className="flex flex-col items-end">
                                            <span>{isProfit ? '+' : ''}₹{pnl.toFixed(2)}</span>
                                            <span className="text-xs opacity-80">{Math.abs(pnlPercent).toFixed(2)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {portfolio.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No investments yet. Start trading to build your portfolio!
                    </div>
                )}
            </div>
        </Card>
    );
};

export default PortfolioTable;
