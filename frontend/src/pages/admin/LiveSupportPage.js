// FILE: src/pages/admin/LiveSupportPage.js

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

// --- Component Imports ---
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';

// --- Icon Imports ---
import { StarIcon, PaperAirplaneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';

// --- Theme-Aware Sub-component for a cleaner, more readable layout ---
const ChatMessage = ({ msg, currentAdminId }) => {
    const isSentByAdmin = msg.sender_id === currentAdminId;
    return (
        <div className={`flex items-end gap-2 ${isSentByAdmin ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex flex-col space-y-2 text-sm max-w-xs mx-2 ${isSentByAdmin ? 'order-1 items-end' : 'order-2 items-start'}`}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`px-4 py-2 rounded-2xl whitespace-pre-wrap break-words ${isSentByAdmin ? 'rounded-br-none bg-primary text-white' : 'rounded-bl-none bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'}`}
                >
                    <p>{msg.content}</p>
                </motion.div>
                 <p className="text-xs text-neutral-400">{formatDistanceToNow(parseISO(msg.timestamp), { addSuffix: true })}</p>
            </div>
        </div>
    );
};

const LiveSupportPage = () => {
    const { t } = useTranslation();
    const { authToken, dbUser } = useAuth();
    
    // API call now correctly uses the admin endpoint which sorts by priority.
    const { data: conversations, loading, error, request: refetch } = useApi('/admin/support/conversations');
    
    const [selectedConvo, setSelectedConvo] = useState(null);
    const [messages, setMessages] = useState([]);
    const ws = useRef(null);
    const messagesEndRef = useRef(null);
    const selectedConvoIdRef = useRef(null); // Ref to hold the current ID for the WebSocket closure

    useEffect(() => {
        if (selectedConvo) {
            setMessages(selectedConvo.messages || []);
            selectedConvoIdRef.current = selectedConvo.id;
        } else {
            setMessages([]);
            selectedConvoIdRef.current = null;
        }
    }, [selectedConvo]);

    // WebSocket Connection Management
    useEffect(() => {
        if (!authToken || !dbUser) return;
        
        const wsUrl = (process.env.REACT_APP_API_BASE_URL || window.location.origin).replace(/^http/, 'ws');
        if (!wsUrl) return;

        ws.current = new WebSocket(`${wsUrl}/chat/ws?token=${authToken}`);
        ws.current.onopen = () => console.log("Admin WebSocket connected");
        ws.current.onclose = () => console.log("Admin WebSocket disconnected");
        ws.current.onerror = (err) => console.error("WebSocket Error:", err);

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'new_message' && data.payload.conversation_id === selectedConvoIdRef.current) {
                setMessages(prev => [...prev, data.payload]);
            } else if (data.type === 'admin_notification' || (data.type === 'new_message' && data.payload.conversation_id !== selectedConvoIdRef.current)) {
                // A message arrived for another conversation, or a new one started. Refetch the list.
                toast.success(`New message in conversation with ${data.payload.user?.email || 'a user'}`);
                refetch();
            }
        };

        return () => { if (ws.current) ws.current.close(); };
    }, [authToken, dbUser, refetch]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);
    useEffect(scrollToBottom, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        const input = e.target.elements.message;
        const content = input.value.trim();
        if (!content || !selectedConvo || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;

        ws.current.send(JSON.stringify({
            conversation_id: selectedConvo.id,
            content: content,
        }));
        input.value = '';
    };

    const renderConversationList = () => {
        if (loading) return <div className="p-4 text-center"><Spinner /></div>;
        if (error) return <p className="p-4 text-center text-red-500">Could not load support conversations.</p>;
        if (!conversations || conversations.length === 0) {
            return <p className="p-4 text-center text-sm text-neutral-500">No open conversations.</p>;
        }

        return conversations.map((convo) => (
            <button key={convo.id} onClick={() => setSelectedConvo(convo)} className={`w-full text-left p-3 rounded-md transition-colors ${selectedConvo?.id === convo.id ? 'bg-primary/10' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
                <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">{convo.user.full_name || convo.user.email}</p>
                    {convo.is_priority && (
                        <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/50 px-2 py-1 text-xs font-medium text-amber-800 dark:text-amber-300">
                            <StarIcon className="h-3 w-3 mr-1.5" /> Priority
                        </span>
                    )}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{convo.subject || 'No Subject'}</p>
            </button>
        ));
    };

    return (
        <DashboardLayout pageTitleKey="live_support_title">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
                <div className="lg:col-span-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg flex flex-col">
                    <h2 className="p-4 text-lg font-semibold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">Open Tickets</h2>
                    <div className="overflow-y-auto p-2 space-y-1">{renderConversationList()}</div>
                </div>

                <div className="lg:col-span-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg flex flex-col">
                    {selectedConvo ? (
                        <>
                            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
                                <h3 className="font-semibold text-neutral-900 dark:text-white">Chat with {selectedConvo.user.full_name}</h3>
                                <p className="text-sm text-neutral-500">{selectedConvo.user.email}</p>
                            </div>
                            <div className="flex-grow p-4 overflow-y-auto space-y-4">{messages.map((msg, index) => <ChatMessage key={msg.id || index} msg={msg} currentAdminId={dbUser?.id} />)}<div ref={messagesEndRef} /></div>
                            <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                                <form onSubmit={handleSend} className="flex items-center space-x-3">
                                    <input name="message" placeholder="Type your message..." autoComplete="off" className="flex-grow bg-neutral-100 dark:bg-neutral-800 border-transparent focus:ring-2 focus:ring-primary rounded-full px-4 py-2 text-sm text-neutral-900 dark:text-white" />
                                    <button type="submit" className="p-3 bg-primary rounded-full text-white hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-neutral-900"><PaperAirplaneIcon className="h-5 w-5" /></button>
                                </form>
                            </div>
                        </>
                    ) : (
                         <div className="flex flex-col justify-center items-center h-full text-neutral-500 dark:text-neutral-400 p-8 text-center">
                            <ChatBubbleLeftRightIcon className="h-16 w-16 text-neutral-400 dark:text-neutral-500" />
                            <h3 className="mt-4 text-lg font-semibold text-neutral-800 dark:text-white">Welcome to the Support Center</h3>
                            <p className="mt-1">Select a conversation from the list to view messages and respond to users.</p>
                         </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default LiveSupportPage;