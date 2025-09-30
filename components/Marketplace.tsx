/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const mockProducts = [
    { id: 1, name: 'Graffiti Blaster Hoodie', price: '120.00', category: 'Items', imageUrl: 'https://picsum.photos/seed/product1/500/500' },
    { id: 2, name: 'Tech Cargo Pants v2', price: '95.00', category: 'Items', imageUrl: 'https://picsum.photos/seed/product2/500/500' },
    { id: 3, name: 'Acid Wash Denim Jacket', price: '155.00', category: 'Items', imageUrl: 'https://picsum.photos/seed/product3/500/500' },
    { id: 4, name: '"Label" Signature Tee', price: '45.00', category: 'Items', imageUrl: 'https://picsum.photos/seed/product4/500/500' },
    { id: 5, name: 'Hi-Top "Vector" Sneakers', price: '180.00', category: 'Items', imageUrl: 'https://picsum.photos/seed/product5/500/500' },
    { id: 6, name: 'Nylon Crossbody Bag', price: '65.00', category: 'Items', imageUrl: 'https://picsum.photos/seed/product6/500/500' },
    { id: 7, name: 'Exclusive Drop Access Pass', price: '50.00', category: 'Tickets', imageUrl: 'https://picsum.photos/seed/ticket1/500/500' },
    { id: 8, name: 'Style Workshop Entry', price: '75.00', category: 'Tickets', imageUrl: 'https://picsum.photos/seed/ticket2/500/500' },
];

interface Product {
    id: number;
    name: string;
    price: string;
    category: string;
    imageUrl: string;
}

const ProductCardSkeleton: React.FC = () => (
    <div className="group relative overflow-hidden rounded-lg bg-gray-900/50 animate-pulse">
        <div className="w-full bg-gray-800/80 aspect-square"></div>
        <div className="absolute bottom-0 left-0 p-4 w-full">
            <div className="h-4 bg-gray-700/80 rounded w-1/4 mb-3"></div>
            <div className="h-6 bg-gray-700/80 rounded w-3/4 mb-2"></div>
            <div className="h-5 bg-gray-700/80 rounded w-1/2"></div>
        </div>
    </div>
);


const Marketplace: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching data from an API
        setIsLoading(true);
        const timer = setTimeout(() => {
            setProducts(mockProducts);
            setIsLoading(false);
        }, 1500); // 1.5-second delay to simulate network latency

        return () => clearTimeout(timer); // Cleanup timer on unmount
    }, []);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl md:text-5xl font-bold font-serif mb-2 text-center">The Collection</h1>
            <p className="text-lg text-gray-400 mb-12 text-center">Latest drops of apparel and exclusive access tickets.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {isLoading 
                    ? (
                        Array.from({ length: 8 }).map((_, index) => (
                            <ProductCardSkeleton key={index} />
                        ))
                    )
                    : (
                        products.map((product, index) => (
                            <motion.div
                                key={product.id}
                                className="group relative overflow-hidden rounded-lg"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <img src={product.imageUrl} alt={product.name} className="w-full h-auto object-cover aspect-square group-hover:scale-105 transition-transform duration-300" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-0 left-0 p-4 w-full">
                                    <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full backdrop-blur-sm">{product.category}</span>
                                    <h3 className="text-lg font-semibold text-white mt-2">{product.name}</h3>
                                    <p className="text-md text-gray-200">${product.price}</p>
                                </div>
                            </motion.div>
                        ))
                    )
                }
            </div>
        </div>
    );
};

export default Marketplace;