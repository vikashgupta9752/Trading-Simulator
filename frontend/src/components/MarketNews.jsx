import React from 'react';
import { Newspaper, ExternalLink, TrendingUp } from 'lucide-react';
import Card from './ui/Card';

const MarketNews = () => {
    const handleReadMore = (e, title) => {
        e.stopPropagation();
        // In a real app, this would open the actual link
        const query = encodeURIComponent(title);
        window.open(`https://www.google.com/search?q=${query}+stock+market+news`, '_blank');
    };

    const news = [
        { id: 1, title: "TCS reports 15% YoY growth in Q3 net profit", source: "Financial Times", time: "2h ago", sentiment: "positive" },
        { id: 2, title: "RBI keeps repo rate unchanged at 6.5% amid inflation concerns", source: "Economic Times", time: "4h ago", sentiment: "neutral" },
        { id: 3, title: "Tech sector faces headwinds as global demand slows", source: "Reuters", time: "6h ago", sentiment: "negative" },
        { id: 4, title: "NIFTY hits all-time high driven by banking stocks", source: "MoneyControl", time: "8h ago", sentiment: "positive" },
        { id: 5, title: "Oil prices surge tensions in Middle East escalate", source: "Bloomberg", time: "10h ago", sentiment: "negative" },
        { id: 6, title: "Infosys announces share buyback program", source: "CNBC", time: "12h ago", sentiment: "positive" },
        { id: 7, title: "Gold imports dip 20% in January", source: "Business Standard", time: "1d ago", sentiment: "neutral" },
        { id: 8, title: "Startup funding sees steady recovery in Q1", source: "TechCrunch", time: "1d ago", sentiment: "positive" }
    ];

    return (
        <Card className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col h-full">
            <div className="p-3 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Newspaper size={16} /> Market News
                </h2>
                <span onClick={() => alert("Redirecting to News section...")} className="text-xs text-blue-500 cursor-pointer hover:text-blue-400">View All</span>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                {news.map((item) => (
                    <div
                        key={item.id}
                        onClick={(e) => handleReadMore(e, item.title)}
                        className="p-3 border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-colors cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs text-gray-500">{item.source} • {item.time}</span>
                            {item.sentiment === 'positive' && <TrendingUp size={14} className="text-green-500" />}
                        </div>
                        <h4 className="text-sm font-medium text-gray-200 group-hover:text-white leading-snug mb-2">
                            {item.title}
                        </h4>
                        <div className="flex items-center text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            Read full story <ExternalLink size={10} className="ml-1" />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default MarketNews;
