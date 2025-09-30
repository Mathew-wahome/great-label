/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { MessageCircleIcon, XIcon, ArrowUpIcon } from './icons';
import { startChat } from '../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';
import Spinner from './Spinner';

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: "What's good? I'm Mosalah, your AI style expert. Ask me about streetwear, sneakers, or what to wear." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chatRef.current) {
            chatRef.current = startChat();
        }
    }, []);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = useCallback(async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            if (!chatRef.current) throw new Error("Chat not initialized");

            const stream = await chatRef.current.sendMessageStream({ message: input });

            let botResponse = '';
            setMessages(prev => [...prev, { sender: 'bot', text: '' }]);

            for await (const chunk of stream) {
                botResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = botResponse;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading]);

    const fabVariants: Variants = {
        hidden: { scale: 0, y: 50 },
        visible: { scale: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20, delay: 0.5 } },
    };
    
    const chatWindowVariants: Variants = {
        closed: { opacity: 0, y: 30, scale: 0.95 },
        open: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    };

    return (
        <>
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-2xl z-50"
                aria-label="Toggle Chat"
                variants={fabVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                {isOpen ? <XIcon className="w-8 h-8"/> : <MessageCircleIcon className="w-8 h-8"/>}
            </motion.button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={chatWindowVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className="fixed bottom-28 right-6 w-[calc(100vw-3rem)] max-w-sm h-[60vh] max-h-[700px] bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
                    >
                        <header className="p-4 border-b border-gray-700">
                            <h3 className="text-xl font-serif font-bold">Mosalah</h3>
                            <p className="text-sm text-gray-400">AI Style Expert</p>
                        </header>

                        <div className="flex-grow p-4 overflow-y-auto space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs md:max-w-sm rounded-2xl px-4 py-2 text-white ${msg.sender === 'user' ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start gap-3">
                                    <div className="bg-gray-700 rounded-2xl rounded-bl-none px-4 py-3">
                                        <Spinner/>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t border-gray-700">
                            <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Ask about style..."
                                    className="flex-grow bg-transparent text-white placeholder-gray-500 focus:outline-none px-3"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!input.trim() || isLoading}
                                    className="w-10 h-10 flex-shrink-0 bg-white text-black rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ArrowUpIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Chatbot;