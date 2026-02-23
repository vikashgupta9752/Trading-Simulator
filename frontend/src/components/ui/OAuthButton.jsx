import React from 'react';

const OAuthButton = ({ provider, icon, onClick, href }) => {
    // If href is provided, it's a link (backend redirect). Otherwise it's a button.
    const Component = href ? 'a' : 'button';

    return (
        <Component
            href={href}
            onClick={onClick}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
            <span className="sr-only">Sign in with {provider}</span>
            <div className="w-5 h-5 mr-2 flex items-center justify-center">
                {icon}
            </div>
            <span>{provider}</span>
        </Component>
    );
};

export default OAuthButton;
