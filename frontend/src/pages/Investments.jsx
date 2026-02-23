import React from 'react';
import PortfolioTable from '../components/PortfolioTable';

const Investments = () => {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">My <span className="text-blue-500">Investments</span></h1>
                    <p className="text-gray-400 font-medium">Manage your portfolio node and growth analytics</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            const csvContent = "data:text/csv;charset=utf-8,"
                                + "Ticker,Quantity,Avg Buy Price\n"
                                + "RELIANCE,140,2945.20\n"
                                + "ZOMATO,2500,165.40\n"
                                + "TCS,45,3940.10";
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", "portfolio_report.csv");
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-bold text-gray-300 hover:text-white transition-all"
                    >
                        Download Report
                    </button>
                    <button className="px-6 py-2.5 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all">Rebalance Portfolio</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Overall Gain', value: '+₹16,570.20', sub: '+12.4%', color: 'text-green-400' },
                    { label: 'Today\'s Gain', value: '+₹1,240.00', sub: '+0.8%', color: 'text-green-400' },
                    { label: 'Buying Power', value: '₹42,300.00', sub: 'Ready to trade', color: 'text-blue-400' },
                ].map(stat => (
                    <div key={stat.label} className="bg-gray-900/40 border border-gray-800 p-6 rounded-3xl backdrop-blur-sm">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{stat.label}</div>
                        <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-gray-400 mt-1 font-medium">{stat.sub}</div>
                    </div>
                ))}
            </div>

            <PortfolioTable />
        </div>
    );
};

export default Investments;
