
import React from 'react';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-950 font-sans text-gray-100 flex flex-col">
            <Navbar user={user} onLogout={logout} />
            <main className="flex-1 flex flex-col w-full">
                {children}
            </main>
        </div>
    );
};

export default Layout;
