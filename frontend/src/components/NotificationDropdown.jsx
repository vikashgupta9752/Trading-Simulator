import React from 'react';
import { X, Check, Info, AlertTriangle } from 'lucide-react';

const NotificationDropdown = ({ notifications, onClose, onClear }) => {
    return (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl overflow-hidden ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                        <button
                            onClick={onClear}
                            className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            Clear all
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            <div className="max-h-96 overflow-y-auto custom-scrollbar bg-gray-900">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-12 h-12 bg-gray-800/50 rounded-full flex items-center justify-center mb-3">
                            <Info size={24} className="text-gray-500" />
                        </div>
                        <p className="text-sm text-gray-400">No new notifications</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-800">
                        {notifications.map((notification) => (
                            <div key={notification.id} className="p-4 hover:bg-gray-800/50 transition-colors">
                                <div className="flex gap-3">
                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notification.type === 'SUCCESS' ? 'bg-green-500' :
                                            notification.type === 'ERROR' ? 'bg-red-500' :
                                                'bg-blue-500'
                                        }`} />
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <p className="text-sm font-medium text-white truncate">
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-gray-400 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-gray-500">
                                            {new Date(notification.timestamp).toLocaleTimeString()}
                                        </p>
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

export default NotificationDropdown;
