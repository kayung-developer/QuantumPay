import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperAirplaneIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useApiPost } from '../../hooks/useApi';
import { useTranslation } from 'react-i18next';

const AIAssistantWidget = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    
    // [I18N] The initial welcome message is now translated.
    const [messages, setMessages] = useState([
        { role: 'assistant', content: t('ai_welcome_message') }
    ]);
    
    const { post: sendQuery, loading } = useApiPost('/ai-assistant/query');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, loading]);

    const handleSend = async (e) => {
        e.preventDefault();
        const input = e.target.elements.query;
        if (!input.value.trim()) return;

        const userMessage = { role: 'user', content: input.value };
        setMessages(prev => [...prev, userMessage]);

        const queryValue = input.value;
        input.value = '';

        const result = await sendQuery({ query: queryValue });

        if (result.success && result.data.content) {
            const assistantMessage = { role: 'assistant', content: result.data.content };
            setMessages(prev => [...prev, assistantMessage]);
        } else {
            // [I18N] The fallback error message is now translated.
            const errorMessage = { role: 'assistant', content: t('ai_error_message') };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    return (
        <>
            {/* --- FAB (Floating Action Button) --- */}
            <div className="fixed bottom-6 right-6 z-50">
                <motion.button
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="p-4 bg-primary rounded-full shadow-lg text-white transform-gpu transition-all duration-300 hover:shadow-2xl hover:bg-primary-dark"
                    aria-label="Open AI Assistant"
                >
                    <SparklesIcon className="h-8 w-8" />
                </motion.button>
            </div>

            {/* --- Chat Window --- */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        // [THEME-AWARE] Correctly styled for light/dark modes
                        className="fixed bottom-24 right-6 z-50 w-full max-w-sm h-[70vh] max-h-[600px] bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                            <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center">
                                <SparklesIcon className="h-5 w-5 mr-2 text-primary"/>
                                {t('ai_assistant_title')}
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                                <XMarkIcon className="h-5 w-5"/>
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-grow p-4 overflow-y-auto space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {/* [THEME-AWARE] Correctly styled messages for light/dark modes */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`max-w-xs px-4 py-2 rounded-2xl ${
                                            msg.role === 'user' 
                                            ? 'bg-primary text-white rounded-br-lg' 
                                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-bl-lg'
                                        }`}
                                    >
                                        <p className="text-sm">{msg.content}</p>
                                    </motion.div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="max-w-xs px-4 py-2 rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                                       <div className="flex items-center space-x-1">
                                           <div className="h-2 w-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                           <div className="h-2 w-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                           <div className="h-2 w-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce"></div>
                                       </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="flex-shrink-0 p-4 border-t border-neutral-200 dark:border-neutral-700">
                            <form onSubmit={handleSend} className="flex items-center space-x-2">
                                <input
                                    name="query"
                                    type="text"
                                    placeholder={t('ai_input_placeholder')}
                                    // [THEME-AWARE] Correctly styled input for light/dark modes
                                    className="flex-grow bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-full px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary text-sm text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                                    disabled={loading}
                                />
                                <button type="submit" className="p-2 bg-primary rounded-full text-white enabled:hover:bg-primary-dark disabled:opacity-50 transition-colors" disabled={loading}>
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
