import React, { useState } from 'react';
import { X, CreditCard, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import Input from './ui/Input';

const WalletModal = ({ isOpen, onClose, onUpdate, balance }) => {
    const [activeTab, setActiveTab] = useState('DEPOSIT');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { user } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const token = user.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const endpoint = activeTab === 'DEPOSIT' ? '/wallet/add' : '/wallet/withdraw';

            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}${endpoint}`, { amount }, config);

            setMessage({ type: 'success', text: data.message });
            setAmount('');
            if (onUpdate) onUpdate(); // Refresh user balance in navbar

            setTimeout(() => {
                setMessage('');
                if (activeTab === 'DEPOSIT') onClose();
            }, 1500);

        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Transaction failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <CreditCard className="text-blue-500" size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Wallet</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 p-1 bg-gray-900 border-b border-gray-800">
                    <button
                        onClick={() => setActiveTab('DEPOSIT')}
                        className={`py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all relative ${activeTab === 'DEPOSIT' ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <ArrowUpRight size={16} />
                        Deposit
                        {activeTab === 'DEPOSIT' && <div className="absolute bottom-0 w-full h-0.5 bg-green-500 rounded-t-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('WITHDRAWAL')}
                        className={`py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all relative ${activeTab === 'WITHDRAWAL' ? 'text-red-400' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <ArrowDownLeft size={16} />
                        Withdraw
                        {activeTab === 'WITHDRAWAL' && <div className="absolute bottom-0 w-full h-0.5 bg-red-500 rounded-t-full" />}
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <h2 className="text-sm font-bold text-gray-400 mb-1">Current Balance</h2>
                        <h2 className="text-3xl font-bold text-white">₹{balance?.toLocaleString() || user?.balance?.toLocaleString() || '0.00'}</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label={activeTab === 'DEPOSIT' ? "Amount to Add" : "Amount to Withdraw"}
                            type="number"
                            placeholder="Enter amount (e.g. 5000)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            min="1"
                            className="bg-gray-800 border-gray-700 text-white focus:border-blue-500"
                        />

                        {message && (
                            <div className={`p-3 rounded-lg text-sm font-medium text-center ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className={`w-full py-4 text-base font-bold shadow-lg ${activeTab === 'DEPOSIT'
                                ? 'bg-green-600 hover:bg-green-500 shadow-green-900/20'
                                : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
                                }`}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : (activeTab === 'DEPOSIT' ? 'Confirm Deposit' : 'Confirm Withdrawal')}
                        </Button>
                    </form>
                </div>

                <div className="p-4 bg-gray-800/30 text-center text-xs text-gray-500">
                    Secure transaction encrypted via 256-bit SSL
                </div>
            </div>
        </div>
    );
};

export default WalletModal;
