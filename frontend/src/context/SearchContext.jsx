import React, { createContext, useState, useContext } from 'react';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [submitTrigger, setSubmitTrigger] = useState(0);

    const triggerSearch = () => setSubmitTrigger(prev => prev + 1);

    return (
        <SearchContext.Provider value={{ searchQuery, setSearchQuery, submitTrigger, triggerSearch }}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => useContext(SearchContext);
