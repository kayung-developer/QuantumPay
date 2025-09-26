import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/solid';
import useApi, { useApiPost } from '../../hooks/useApi';
import Spinner from '../common/Spinner';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';

const ChatWidget = () => {
    const { dbUser, authToken } = useAuth();
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [conversation, setConversation] = useState(null);
    const ws = useRef(null);
    const messagesEndRef = useRef(null);

    // [REAL SYSTEM] Use a ref to hold the conversation ID to prevent stale closures in the WebSocket `onmessage` handler.
    const conversationIdRef = useRef();

    const { data: history, loading: historyLoading, request: fetchHistory } = useApi('/chat/conversations', { manual: true });
    const { post: createConversation, loading: createLoading } = useApiPost('/chat/conversations');

    const handleStartNewConversation = async () => {
        const result = await createConversation({});
        if (result.success) {
            setConversation(result.data);
            setMessages(result.data.messages || []);
        }
    };

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);
    useEffect(scrollToBottom, [messages, historyLoading]);

    // Effect to fetch history when the widget is opened
    useEffect(() => {
        if (isOpen && dbUser) {
            fetchHistory();
        }
    }, [isOpen, dbUser, fetchHistory]);
    
    // Effect to set the conversation and messages once history is loaded
    useEffect(() => {
        if (history && history.length > 0) {
            setConversation(history[0]);
            setMessages(history[0].messages || []);
            conversationIdRef.current = history[0].id;
        } else {
            setConversation(null);
            setMessages([]);
        }
    }, [history]);

    // WebSocket connection management
    useEffect(() => {
        if (!isOpen || !authToken || !conversation) {
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }
            return;
        }

        const wsUrl = (process.env.REACT_APP_API_BASE_URL || "").replace(/^http/, 'ws');
        if (!wsUrl) return;

        ws.current = new WebSocket(`${wsUrl}/chat/ws?token=${authToken}`);
        ws.current.onopen = () => console.log("WebSocket connected");
        ws.current.onclose = () => console.log("WebSocket disconnected");

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // [REAL SYSTEM] Use the ref to get the current conversation ID for comparison.
            if (data.type === 'new_message' && data.payload.conversation_id === conversationIdRef.current) {
                setMessages(prev => [...prev, data.payload]);
            }
        };

        return () => {
            if (ws.current?.readyState === WebSocket.OPEN) {
                ws.current.close();
            }
        };
    }, [isOpen, authToken, conversation]);

    const handleSend = (e) => {
        e.preventDefault();
        const input = e.target.elements.message;
        if (!input.value.trim() || !conversation || ws.current?.readyState !== WebSocket.OPEN) return;

        ws.current.send(JSON.stringify({
            conversation_id: conversation.id,
            content: input.value,
        }));
        input.value = '';
    };

    const renderChatContent = () => {
        if (historyLoading) {
            return <div className="flex h-full items-center justify-center"><Spinner /></div>;
        }

        if (!conversation) {
            return (
                <div className="flex flex-col h-full items-center justify-center p-4 text-center">
                    <p className="text-neutral-600 dark:text-neutral-400">{t('chat_welcome')}</p>
                    <button onClick={handleStartNewConversation} disabled={createLoading} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50">
                        {createLoading ? <Spinner size="sm" /> : t('start_chat_button')}
                    </button>
                </div>
            );
        }

        return (
            <>
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, i) => (
                        <div key={msg.id || i} className={`flex ${msg.sender_id === dbUser.id ? 'justify-end' : 'justify-start'}`}>
                             <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`max-w-xs px-4 py-2 rounded-2xl ${msg.sender_id === dbUser.id ? 'bg-primary text-white rounded-br-lg' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-bl-lg'}`}
                             >
                                <p className="text-sm">{msg.content}</p>
                                <p className={`text-xs mt-1 opacity-70 ${msg.sender_id === dbUser.id ? 'text-right' : 'text-left'}`}>
                                    {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                                </p>
                            </motion.div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="flex-shrink-0 p-4 border-t border-neutral-200 dark:border-neutral-700">
                    <form onSubmit={handleSend} className="flex items-center space-x-2">
                        <input
                            name="message"
                            placeholder={t('chat_placeholder')}
                            className="flex-grow bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-full px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary text-sm text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                        />
                        <button type="submit" className="p-2 bg-primary rounded-full text-white enabled:hover:bg-primary-dark disabled:opacity-50 transition-colors">
                            <PaperAirplaneIcon className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            </>
        );
    };

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50">
                <motion.button whileHover={{ scale: 1.1, rotate: -15 }} whileTap={{ scale: 0.9 }} onClick={() => setIsOpen(true)} className="p-4 bg-primary rounded-full shadow-lg text-white">
                    <ChatBubbleLeftRightIcon className="h-8 w-8" />
                </motion.button>
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }} className="fixed bottom-24 right-6 z-50 w-full max-w-sm h-[70vh] max-h-[600px] bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-2xl flex flex-col">
                        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                            <h3 className="font-semibold text-neutral-900 dark:text-white">{t('support_chat_title')}</h3>
                            <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                                <XMarkIcon className="h-5 w-5"/>
                            </button>
                        </div>
                        {renderChatContent()}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatWidget;
