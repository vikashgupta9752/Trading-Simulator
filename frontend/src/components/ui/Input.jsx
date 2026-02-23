
import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    {label}
                </label>
            )}
            <input
                className={`w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900/50 focus:border-groww-primary focus:ring-2 focus:ring-groww-primary/20 focus:outline-none transition-all text-white placeholder-gray-500 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

export default Input;
