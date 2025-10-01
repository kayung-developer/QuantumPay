import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon, XMarkIcon, StarIcon } from '@heroicons/react/24/solid';
import { useApi, useApiPost } from '../../hooks/useApi';
import Spinner from '../common/Spinner';
import Button from '../common/Button';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid'; // Ensure you have installed uuid: npm install uuid

const safeFormatDistanceToNow = (dateString) => {
    try {
        if (!dateString) return 'just now'; // Fallback for optimistic messages
        const date = parseISO(dateString);
        if (isNaN(date.getTime())) return 'invalid date';
        return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
        return 'a moment ago';
    }
};


const ChatWidget = () => {
    const { dbUser, authToken, hasActiveSubscription } = useAuth();
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [conversation, setConversation] = useState(null);
    const ws = useRef(null);
    const messagesEndRef = useRef(null);
    const conversationIdRef = useRef(null);

    const { data: history, loading: historyLoading, request: fetchHistory } = useApi('/chat/conversations', { manual: true });
    const { post: createConversation, loading: createLoading } = useApiPost('/chat/conversations');

    const isPriority = hasActiveSubscription('premium');

    const handleStartNewConversation = async () => {
        const result = await createConversation({});
        if (result.success) {
            setConversation(result.data);
            setMessages(result.data.messages || []);
            conversationIdRef.current = result.data.id;
        }
    };

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, historyLoading, isOpen, scrollToBottom]);

    useEffect(() => {
        if (isOpen && dbUser) {
            fetchHistory();
        }
    }, [isOpen, dbUser, fetchHistory]);
    
    useEffect(() => {
        if (history && history.length > 0) {
            const latestConvo = history[0];
            setConversation(latestConvo);
            setMessages(latestConvo.messages || []);
            conversationIdRef.current = latestConvo.id;
        } else if (history) {
            setConversation(null);
            setMessages([]);
        }
    }, [history]);

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
        ws.current.onopen = () => console.log("User WebSocket connected");
        ws.current.onclose = () => console.log("User WebSocket disconnected");

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'new_message' && data.payload.conversation_id === conversationIdRef.current) {
                const receivedMessage = data.payload;
                setMessages(prev => {
                    // Replace optimistic message with the real one from the server
                    if (prev.some(msg => msg.tempId === receivedMessage.tempId)) {
                        return prev.map(msg => msg.tempId === receivedMessage.tempId ? receivedMessage : msg);
                    }
                    // Prevent adding duplicates if the message is already present
                    if (prev.some(msg => msg.id === receivedMessage.id)) {
                        return prev;
                    }
                    return [...prev, receivedMessage];
                });
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
        const content = input.value.trim();
        if (!content || !conversation || ws.current?.readyState !== WebSocket.OPEN) return;

        const tempId = uuidv4();
        const optimisticMessage = {
            id: null,
            tempId,
            sender_id: dbUser.id,
            content,
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, optimisticMessage]);

        ws.current.send(JSON.stringify({
            conversation_id: conversation.id,
            content,
            tempId,
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
                    <Button onClick={handleStartNewConversation} disabled={createLoading} className="mt-4">
                        {createLoading ? <Spinner size="sm" /> : t('start_chat_button')}
                    </Button>
                </div>
            );
        }

        return (
            <>
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id || msg.tempId} className={`flex ${msg.sender_id === dbUser.id ? 'justify-end' : 'justify-start'}`}>
                             <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`max-w-[85%] px-4 py-2 rounded-2xl transition-opacity ${msg.id === null ? 'opacity-60' : 'opacity-100'} ${msg.sender_id === dbUser.id ? 'bg-primary text-white rounded-br-none' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-bl-none'}`}
                             >
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                <p className={`text-xs mt-1 opacity-70 ${msg.sender_id === dbUser.id ? 'text-right' : 'text-left'}`}>
                                    {msg.id ? safeFormatDistanceToNow(msg.timestamp) : t('chat_sending_status')}
                                </p>
                            </motion.div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="flex-shrink-0 p-4 border-t border-neutral-200 dark:border-neutral-700">
                    <form onSubmit={handleSend} className="flex items-center space-x-3">
                        <input
                            name="message"
                            placeholder={t('chat_placeholder')}
                            autoComplete="off"
                            className="flex-grow bg-neutral-100 dark:bg-neutral-800 border-transparent focus:ring-2 focus:ring-primary rounded-full px-4 py-2 text-sm text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                        />
                        <button type="submit" className="p-3 bg-primary rounded-full text-white enabled:hover:bg-primary-dark disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-neutral-900">
                            <PaperAirplaneIcon className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            </>
        );
    };

    if (!dbUser) {
        return null; // Don't render the chat widget for logged-out users
    }

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50">
                <motion.button whileHover={{ scale: 1.1, rotate: -15 }} whileTap={{ scale: 0.9 }} onClick={() => setIsOpen(true)} className="p-4 bg-primary rounded-full shadow-lg text-white">
                    <ChatBubbleLeftRightIcon className="h-8 w-8" />
                </motion.button>
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.95 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        exit={{ opacity: 0, y: 50, scale: 0.95 }} 
                        className="fixed bottom-24 right-6 z-[100] w-full max-w-sm h-[70vh] max-h-[600px] bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-2xl flex flex-col"
                    >
                        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                            <div>
                                <h3 className="font-semibold text-neutral-900 dark:text-white">{t('support_chat_title')}</h3>
                                {/* --- [THE FEATURE IMPLEMENTATION] Conditionally render the Priority status --- */}
                                {isPriority && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center mt-1">
                                        <StarIcon className="h-4 w-4 mr-1" />
                                        {t('priority_support_badge')}
                                    </p>
                                )}
                            </div>
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
