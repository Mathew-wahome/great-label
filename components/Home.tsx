/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InstagramFeed from './InstagramFeed';

interface HomeProps {
    setActivePage: (page: string) => void;
}

const carouselImages = [
    'https://storage.googleapis.com/prompt-gallery/user-provided/sneaker_tree.jpg',
    'https://storage.googleapis.com/prompt-gallery/user-provided/man_with_bags.jpg',
    'https://storage.googleapis.com/prompt-gallery/user-provided/shoes_and_bags.jpg',
    'https://storage.googleapis.com/prompt-gallery/user-provided/man_posing.jpg',
];

const Home: React.FC<HomeProps> = ({ setActivePage }) => {
    const [imageIndex, setImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setImageIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <div className="relative h-[calc(100vh-5rem)] flex items-center justify-center text-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <AnimatePresence>
                        <motion.img
                            key={imageIndex}
                            src={carouselImages[imageIndex]}
                            alt="Fashion background"
                            className="w-full h-full object-cover"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.3 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5, ease: 'easeInOut' }}
                        />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 p-4"
                >
                    <h1 className="text-5xl md