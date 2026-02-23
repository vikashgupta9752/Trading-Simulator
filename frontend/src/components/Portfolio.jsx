import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Briefcase, ArrowUpRight } from 'lucide-react';

const Portfolio = ({ refreshTrigger }) => {
    const [portfolio, setPortfolio] = useState([]);
    const { user } = useContext(AuthContext);

    const fetchPortfolio = async () => {
        if (!user) return;
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/users/me`, config);
            setPortfolio(data.portfolio || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchPortfolio();
    }, [user, refreshTrigger]);

    return (
        <div className="h-full flex flex-col">
            <div className="sticky top-0 bg-gray-900/90 backdrop-blur pb-2 z-10 border-b border-gray-800 flex justify-between items-center">
                <h3 className="font-bold text-sm text-gray-400 uppercase tracking-wider">Portfolio</h3>
                {/* <span className="text-xs text-green-400 font-bold">+12% Today</span> */}
            </div>

            <div className="flex-1 overflow-auto">
                {portfolio.length === 0 ? (
                    <div className="py-8 text-center text-gray-600 text-sm">
                        No positions
                    </div>
                ) : (
                    <div className="divide-y divide-gray-800">
                        {portfolio.map((asset, index) => (
                            <div key={index} className="py-3 hover:bg-gray-800/30 transition-colors flex justify-between items-center px-2">
                                <div>
                                    <h4 className="font-bold text-white text-sm">{asset.ticker}</h4>
                                    <div className="text-xs text-gray-500">{asset.quantity} Qty</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium text-white text-sm">₹{(100 * asset.quantity).toFixed(2)}</div>
                                    <div className="text-xs text-green-500 flex items-center justify-end">
                                        <ArrowUpRight size={10} className="mr-0.5" /> 2.4%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Portfolio;
