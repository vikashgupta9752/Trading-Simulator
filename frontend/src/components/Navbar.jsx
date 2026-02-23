import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, X, Wallet, LogOut, ChevronDown, User as UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import WalletModal from './WalletModal';
import axios from 'axios';
import { useSearch } from '../context/SearchContext';
import NotificationDropdown from './NotificationDropdown';
import socket from '../socket';

const Navbar = ({ user, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isWalletOpen, setIsWalletOpen] = useState(false);
    const [currentBalance, setCurrentBalance] = useState(user?.balance || 0);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const { searchQuery, setSearchQuery } = useSearch();

    // Sync local state with prop
    useEffect(() => {
        if (user) setCurrentBalance(user.balance || 0);
    }, [user]);

    // Load notifications from session storage
    useEffect(() => {
        const saved = sessionStorage.getItem('notifications');
        if (saved) {
            setNotifications(JSON.parse(saved));
        }
    }, []);

    // Socket Listener for Trade Updates
    useEffect(() => {
        if (!user) return;

        const handleTradeUpdate = (trade) => {
            // Check if this user is involved
            if (trade.buyerId === user._id || trade.sellerId === user._id) {
                const isBuyer = trade.buyerId === user._id;
                const type = 'SUCCESS';
                const title = isBuyer ? `Buy Order Filled` : `Sell Order Filled`;
                const message = `You successfully ${isBuyer ? 'bought' : 'sold'} ${trade.quantity} ${trade.ticker} at ₹${trade.price}`;

                const newNotification = {
                    id: Date.now(),
                    type,
                    title,
                    message,
                    timestamp: new Date().toISOString()
                };

                setNotifications(prev => {
                    const updated = [newNotification, ...prev];
                    sessionStorage.setItem('notifications', JSON.stringify(updated));
                    return updated;
                });
                setUnreadCount(prev => prev + 1);

                // Also refresh balance as it would have changed
                refreshBalance();
            }
        };

        socket.on('tradeUpdate', handleTradeUpdate);

        return () => {
            socket.off('tradeUpdate', handleTradeUpdate);
        };
    }, [user]);

    const handleLogout = () => {
        onLogout();
        navigate('/login');
    };

    const refreshBalance = async () => {
        try {
            const token = user.token;
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentBalance(data.balance || 0);
            // Optionally update global user context here if possible, but local state works for immediate feedback
        } catch (error) {
            console.error("Failed to refresh balance", error);
        }
    };

    return (
        <>
            <nav className="bg-groww-card border-b border-gray-800 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo and Mobile Menu Button */}
                        <div className="flex items-center">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="sm:hidden p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                            <Link to="/" className="flex-shrink-0 flex items-center ml-2 sm:ml-0 gap-2">
                                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold text-white tracking-tight">Trade<span className="text-blue-500">X</span></span>
                            </Link>
                        </div>



                        {/* Desktop Search - Centered */}
                        <div className="hidden sm:flex flex-1 justify-center px-8 items-center">
                            <div className="w-full max-w-2xl relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            if (searchQuery.trim()) {
                                                triggerSearch();
                                                // If we are on Explore or Dashboard, it will handle it.
                                                // If we are elsewhere, navigate to dashboard to show results.
                                                if (!window.location.pathname.includes('/app')) {
                                                    navigate('/app');
                                                }
                                            }
                                        }
                                    }}
                                    className="block w-full pl-10 pr-3 py-2.5 border-none rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                                    placeholder="Search stocks, mutual funds..."
                                />
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3 sm:gap-4">

                            <div className="hidden md:flex items-center gap-6 mr-4">
                                <Link to="/app/explore" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Explore</Link>
                                <Link to="/app/investments" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Investments</Link>
                            </div>

                            {user ? (
                                <>

                                    <div className="relative">
                                        <button
                                            className="p-2 text-gray-400 hover:text-white relative"
                                            onClick={() => {
                                                setIsNotificationsOpen(!isNotificationsOpen);
                                                if (!isNotificationsOpen) setUnreadCount(0);
                                            }}
                                        >
                                            <Bell size={20} />
                                            {unreadCount > 0 && (
                                                <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full ring-2 ring-gray-900 bg-red-500 animate-pulse"></span>
                                            )}
                                        </button>
                                        {isNotificationsOpen && (
                                            <NotificationDropdown
                                                notifications={notifications}
                                                onClose={() => setIsNotificationsOpen(false)}
                                                onClear={() => {
                                                    setNotifications([]);
                                                    sessionStorage.removeItem('notifications');
                                                }}
                                            />
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setIsWalletOpen(true)}
                                        className="p-2 text-gray-400 hover:text-white"
                                    >
                                        <Wallet size={20} />
                                    </button>

                                    <div className="relative ml-2">
                                        <button
                                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                                            className="flex items-center focus:outline-none"
                                        >
                                            <div className="h-9 w-9 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-sm border-2 border-gray-800 shadow-sm">
                                                {user?.username ? user.username.charAt(0).toUpperCase() : <UserIcon size={16} />}
                                            </div>
                                        </button>

                                        {isProfileOpen && (
                                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in zoom-in duration-100">
                                                <div className="px-4 py-3 border-b border-gray-700">
                                                    <p className="text-sm font-medium text-white">{user?.username || 'User'}</p>
                                                    <p className="text-xs text-gray-400 truncate mt-0.5">ID: {user?._id?.substring(0, 8)}...</p>
                                                </div>
                                                <div className="md:hidden px-4 py-2 border-b border-gray-700">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-gray-400">Balance</span>
                                                        <span className="text-sm font-bold text-white">₹{(currentBalance || 0).toLocaleString()}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => { setIsWalletOpen(true); setIsProfileOpen(false); }}
                                                        className="w-full mt-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-1 px-2 rounded"
                                                    >
                                                        TOP UP
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700/50 flex items-center transition-colors"
                                                >
                                                    <LogOut size={16} className="mr-2" />
                                                    Sign out
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link to="/login">
                                        <Button className="bg-transparent border border-gray-700 hover:bg-gray-800 text-xs py-1.5 px-3 font-bold">Login</Button>
                                    </Link>
                                    <Link to="/register">
                                        <Button className="bg-blue-600 hover:bg-blue-500 text-xs py-1.5 px-3 font-bold">Get Started</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <WalletModal
                isOpen={isWalletOpen}
                onClose={() => setIsWalletOpen(false)}
                onUpdate={refreshBalance}
            />
        </>
    );
};

export default Navbar;
