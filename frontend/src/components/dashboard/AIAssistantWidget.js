import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperAirplaneIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useApiPost } from '../../hooks/useApi';

const AIAssistantWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm your QuantumAI Assistant. Ask me about your spending or balance." }
    ]);
    const { post: sendQuery, loading } = useApiPost('/ai-assistant/query');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        const input = e.target.elements.query;
        if (!input.value.trim()) return;

        const userMessage = { role: 'user', content: input.value };
        setMessages(prev => [...prev, userMessage]);

        const queryValue = input.value;
        input.value = '';

        const result = await sendQuery({ query: queryValue });

        if (result.success) {
            const assistantMessage = { role: 'assistant', content: result.data.content };
            setMessages(prev => [...prev, assistantMessage]);
        } else {
             const errorMessage = { role: 'assistant', content: "Sorry, I encountered an error. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="p-4 bg-primary rounded-full shadow-lg text-white"
                >
                    <SparklesIcon className="h-8 w-8" />
                </motion.button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-24 right-6 z-50 w-full max-w-sm h-[60vh] bg-white dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-300 dark:border-neutral-700 rounded-2xl shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-neutral-300 dark:border-neutral-700">
                            <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center"><SparklesIcon className="h-5 w-5 mr-2 text-primary"/> QuantumAI Assistant</h3>
                            <button onClick={() => setIsOpen(false)} className="text-neutral-600 dark:text-neutral-400 hover:text-white"><XMarkIcon className="h-5 w-5"/></button>
                        </div>

                        {/* Messages */}
                        <div className="flex-grow p-4 overflow-y-auto space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-200'}`}>
                                        <p className="text-sm">{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                 <div className="flex justify-start">
                                    <div className="max-w-xs px-4 py-2 rounded-2xl bg-neutral-800 text-neutral-200">
                                       <div className="flex items-center space-x-1">
                                           <div className="h-2 w-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                           <div className="h-2 w-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                           <div className="h-2 w-2 bg-neutral-500 rounded-full animate-bounce"></div>
                                       </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-neutral-300 dark:border-neutral-700">
                            <form onSubmit={handleSend} className="flex items-center space-x-2">
                                <input
                                    name="query"
                                    type="text"
                                    placeholder="Ask me anything..."
                                    className="flex-grow bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 rounded-full px-4 py-2 focus:ring-primary focus:border-primary text-sm"
                                    disabled={loading}
                                />
                                <button type="submit" className="p-2 bg-primary rounded-full text-white" disabled={loading}>
                                    <PaperAirplaneIcon className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIAssistantWidget;