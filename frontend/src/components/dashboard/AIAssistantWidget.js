import React, { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperAirplaneIcon, SparklesIcon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/solid';

// A custom hook for API calls, assumed to be in the project.
// Example: export const useApiPost = (url) => { ... };
import { useApiPost } from '../../hooks/useApi';

// 1. Theme Awareness: Create a Theme Context and Provider
const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            return storedTheme === 'dark';
        }
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.toggle('dark', isDarkMode);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};


const AIAssistantWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm your QuantumAI Assistant. Ask me about your spending or balance." }
    ]);
    const { post: sendQuery, loading, error } = useApiPost('/ai-assistant/query');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const isSubmitting = useRef(false);
    const { isDarkMode, toggleTheme } = useTheme();


    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);


    const handleSend = async (e) => {
        e.preventDefault();
        if (isSubmitting.current) return;

        const inputValue = inputRef.current?.value.trim();
        if (!inputValue) return;

        isSubmitting.current = true;
        const userMessage = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMessage]);

        if(inputRef.current) {
            inputRef.current.value = '';
        }

        try {
            const result = await sendQuery({ query: inputValue });
            if (result.success) {
                const assistantMessage = { role: 'assistant', content: result.data.content };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                const errorMessage = { role: 'assistant', content: "Sorry, I encountered an error. Please try again." };
                setMessages(prev => [...prev, errorMessage]);
            }
        } catch (apiError) {
             const errorMessage = { role: 'assistant', content: "Sorry, there was a problem connecting to the server. Please check your connection and try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            isSubmitting.current = false;
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
                    aria-label="Open AI Assistant"
                >
                    <SparklesIcon className="h-8 w-8" />
                </motion.button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-24 right-6 z-50 w-full max-w-sm h-[70vh] max-h-[600px] bg-white dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-300 dark:border-neutral-700 rounded-2xl shadow-2xl flex flex-col"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ai-assistant-header"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-neutral-300 dark:border-neutral-700">
                            <h3 id="ai-assistant-header" className="font-semibold text-neutral-900 dark:text-white flex items-center">
                                <SparklesIcon className="h-5 w-5 mr-2 text-primary"/> QuantumAI Assistant
                            </h3>
                            <div className="flex items-center space-x-2">
                                <button onClick={toggleTheme} className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white" aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}>
                                    {isDarkMode ? <SunIcon className="h-5 w-5"/> : <MoonIcon className="h-5 w-5"/>}
                                </button>
                                <button onClick={() => setIsOpen(false)} className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white" aria-label="Close AI Assistant">
                                    <XMarkIcon className="h-5 w-5"/>
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-grow p-4 overflow-y-auto space-y-4" role="log" aria-live="polite">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-200'}`}>
                                        <p className="text-sm">{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                 <div className="flex justify-start">
                                    <div className="max-w-xs px-4 py-2 rounded-2xl bg-neutral-100 dark:bg-neutral-800">
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
                                    ref={inputRef}
                                    name="query"
                                    type="text"
                                    placeholder="Ask me anything..."
                                    className="flex-grow bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 rounded-full px-4 py-2 focus:ring-primary focus:border-primary text-sm text-neutral-900 dark:text-neutral-200 disabled:opacity-50"
                                    disabled={loading}
                                    aria-label="Chat input"
                                />
                                <button type="submit" className="p-2 bg-primary rounded-full text-white disabled:opacity-50" disabled={loading}>
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

// To use the widget, wrap your application with the ThemeProvider
// For example, in your main App.js or equivalent:
//
// import { ThemeProvider } from './path-to/AIAssistantWidget';
//
// function App() {
//   return (
//     <ThemeProvider>
//       {/* ... your other components */}
//       <AIAssistantWidget />
//     </ThemeProvider>
//   );
// }

export default AIAssistantWidget;
