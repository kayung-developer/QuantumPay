import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/solid';
import useApi from '../../hooks/useApi';
import Spinner from '../common/Spinner';

const ChatWidget = () => {
    const { dbUser, authToken } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [conversation, setConversation] = useState(null);
    const ws = useRef(null);
    const messagesEndRef = useRef(null);

    const { data: history, loading: historyLoading } = useApi(isOpen ? `/chat/conversations` : null);

    useEffect(() => {
        if (history && history.length > 0) {
            setConversation(history[0]);
            setMessages(history[0].messages);
        } else if (history && history.length === 0) {
            // No existing conversation, could prompt to start one
        }
    }, [history]);

    useEffect(() => {
        if (!isOpen || !authToken) {
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }
            return;
        }

        const wsUrl = process.env.REACT_APP_API_BASE_URL.replace(/^http/, 'ws');
        ws.current = new WebSocket(`${wsUrl}/chat/ws?token=${authToken}`);

        ws.current.onopen = () => console.log("WebSocket connected");
        ws.current.onclose = () => console.log("WebSocket disconnected");
        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'new_message') {
                setMessages(prev => [...prev, data.payload]);
            }
        };

        return () => {
            if (ws.current) ws.current.close();
        };
    }, [isOpen, authToken]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        const input = e.target.elements.message;
        if (!input.value.trim() || !conversation) return;

        ws.current.send(JSON.stringify({
            conversation_id: conversation.id,
            content: input.value,
        }));
        input.value = '';
    };

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50">
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setIsOpen(true)} className="p-4 bg-primary rounded-full shadow-lg text-white">
                    <ChatBubbleLeftRightIcon className="h-8 w-8" />
                </motion.button>
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-24 right-6 z-50 w-full max-w-sm h-[60vh] bg-white dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-300 dark:border-neutral-700 rounded-2xl shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-neutral-300 dark:border-neutral-700">
                            <h3 className="font-semibold text-white">Support Chat</h3>
                            <button onClick={() => setIsOpen(false)}><XMarkIcon className="h-5 w-5"/></button>
                        </div>
                        <div className="flex-grow p-4 overflow-y-auto space-y-4">
                            {historyLoading ? <Spinner/> : messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.sender_id === dbUser.id ? 'justify-end' : 'justify-start'}`}>
                                    <p className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${msg.sender_id === dbUser.id ? 'bg-primary text-white' : 'bg-neutral-800'}`}>{msg.content}</p>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 border-t border-neutral-300 dark:border-neutral-700">
                            <form onSubmit={handleSend} className="flex items-center space-x-2">
                                <input name="message" placeholder="Type your message..." className="flex-grow bg-neutral-800 rounded-full px-4 py-2" />
                                <button type="submit" className="p-2 bg-primary rounded-full text-white"><PaperAirplaneIcon className="h-5 w-5" /></button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatWidget;