/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-gray-800 py-8 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} Great Labels. All Rights Reserved.</p>
            <p className="text-xs mt-2">Created with passion for streetwear culture.</p>
        </div>
    </footer>
  );
};

export default Footer;
