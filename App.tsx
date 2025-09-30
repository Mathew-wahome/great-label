/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Marketplace from './components/Marketplace';
import Blog from './components/Blog';
import FitCheck from './components/FitCheck';
import Chatbot from './components/Chatbot';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('home');

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <Home setActivePage={setActivePage} />;
      case 'marketplace':
        return <Marketplace />;
      case 'blog':
        return <Blog />;
      case 'fit-check':
        return <FitCheck />;
      default:
        return <Home setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="bg-black text-white min-h-screen font-sans">
      <Header activePage={activePage} setActivePage={setActivePage} />
      <main className="pt-20"> {/* Padding to offset fixed header */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default App;
