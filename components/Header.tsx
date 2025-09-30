/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface HeaderProps {
    activePage: string;
    setActivePage: (page: string) => void;
}

const Logo: React.FC = () => (
    <div className="font-serif font-bold text-2xl tracking-wider text-white">
        GREAT LABELS
    </div>
);

const Header: React.FC<HeaderProps> = ({ activePage, setActivePage }) => {
    const navItems = [
        { id: 'home', label: 'Home' },
        { id: 'marketplace', label: 'Shop' },
        { id: 'fit-check', label: 'Fit Check' },
        { id: 'blog', label: 'Blog' },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex-shrink-0 cursor-pointer" onClick={() => setActivePage('home')}>
                        <Logo />
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActivePage(item.id)}
                                    className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        activePage === item.id 
                                            ? 'text-white' 
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {item.label}
                                    {activePage === item.id && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white rounded-full"></span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Mobile menu could be added here */}
                </div>
            </nav>
        </header>
    );
};

export default Header;
