
import React from 'react';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`bg-groww-card rounded-2xl shadow-lg border border-gray-800 p-6 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
