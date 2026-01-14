import React, { useState, useEffect } from 'react';
import {MagnifyingGlassIcon, XMarkIcon} from "@heroicons/react/24/outline";

const SearchBar = ({ onSearch }) => {
    const [input, setInput] = useState('');

    useEffect(() => {
        // Wait 300ms after user stops typing
        const timer = setTimeout(() => {
            onSearch(input);
        }, 300);

        return () => clearTimeout(timer); // Clean up timer on each new keystroke
    }, [input, onSearch]);

    const clearInput = () => {
        setInput('');
    };

    return (
        <div className="px-4 sm:px-5 py-3 sm:py-4 max-w-7xl mx-auto ">
        <div className="relative w-full sm:w-96 ">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
            </div>
            <input
                type="text"
                placeholder="Search YUMY eats restaurants..."
                className="w-full px-10 py-2 border bg-gray-200 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            {input && (
                <button
                    onClick={clearInput}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-300 rounded-r-lg transition-colors"
                    aria-label="Clear search"
                >
                    <XMarkIcon className="w-5 h-5 text-gray-600" />
                </button>
            )}
        </div>
        </div>

    );
};

export default SearchBar;
