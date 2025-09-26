import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/solid';
import useApi, { useApiPost } from '../../hooks/useApi';
import Spinner from '../common/Spinner';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { v4 as uuidv4 } from 'uuid'; // Import a library to generate unique IDs

const ChatWidget = () => {
    const { dbUser, authToken } = useAuth();
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [conversation, setConversation] = useState(null);
    const ws = useRef(null);
    const messagesEndRef = useRef(null);
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

    useEffect(() => {
        if (isOpen && dbUser) {
            fetchHistory();
        }
    }, [isOpen, dbUser, fetchHistory]);
    
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
            if (data.type === 'new_message' && data.payload.conversation_id === conversationIdRef.current) {
                const receivedMessage = data.payload;
                
                // [THE DEFINITIVE FIX - Part 2: Reconciliation]
                // When a message comes from the server, check if we already have a temporary version of it.
                setMessages(prev => {
                    const existing = prev.find(msg => msg.tempId === receivedMessage.tempId && msg.id === null);
                    if (existing) {
                        // If we find the temporary message, replace it with the final one from the server.
                        return prev.map(msg => msg.tempId === receivedMessage.tempId ? receivedMessage : msg);
                    } else {
                        // Otherwise, it's a new message from the other person, so just add it.
                        return [...prev, receivedMessage];
                    }
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

        // [THE DEFINITIVE FIX - Part 1: Optimistic UI Update]
        // 1. Create a temporary message with a unique client-side ID.
        const tempId = uuidv4();
        const optimisticMessage = {
            id: null, // The server will assign the real ID
            tempId: tempId, // Our temporary client-side ID
            sender_id: dbUser.id,
            content: content,
            timestamp: new Date().toISOString(), // Use local time for instant feedback
            conversation_id: conversation.id,
        };

        // 2. Immediately add this temporary message to the UI for an instant response.
        setMessages(prev => [...prev, optimisticMessage]);

        // 3. Send the message to the WebSocket, including the temporary ID.
        ws.current.send(JSON.stringify({
            conversation_id: conversation.id,
            content: content,
            tempId: tempId, // Send the tempId for the backend to echo back
        }));
        
        input.value = '';
    };

    const renderChatContent = () => {
        if (historyLoading) { /* ... spinner logic ... */ }
        if (!conversation) { /* ... start new convo logic ... */ }

        return (
            <>
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, i) => (
                        <div key={msg.id || msg.tempId || i} className={`flex ${msg.sender_id === dbUser.id ? 'justify-end' : 'justify-start'}`}>
                             <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                // [REAL SYSTEM] Add a subtle opacity change if the message is still pending
                                className={`max-w-xs px-4 py-2 rounded-2xl transition-opacity ${msg.id === null ? 'opacity-70' : 'opacity-100'} ${msg.sender_id === dbUser.id ? 'bg-primary text-white rounded-br-lg' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-bl-lg'}`}
                             >
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                <p className={`text-xs mt-1 opacity-70 ${msg.sender_id === dbUser.id ? 'text-right' : 'text-left'}`}>
                                    {msg.id ? formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true }) : 'Sending...'}
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
            {/* ... FAB and Motion Divs (no changes here) ... */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div /* ... */ >
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
