
import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-groww-primary text-white hover:bg-indigo-600 focus:ring-groww-primary",
        secondary: "bg-groww-blue text-white hover:bg-blue-600 focus:ring-groww-blue",
        outline: "border-2 border-groww-primary text-groww-primary hover:bg-indigo-50 focus:ring-groww-primary",
        ghost: "bg-transparent text-groww-dark hover:bg-gray-100",
        danger: "bg-groww-red text-white hover:bg-red-600 focus:ring-groww-red",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-5 py-2.5 text-base",
        lg: "px-6 py-3 text-lg",
        icon: "p-2",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
