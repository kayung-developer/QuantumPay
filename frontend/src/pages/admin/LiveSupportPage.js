import React, { useState, useEffect, useRef, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useApi from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import { format } from 'date-fns';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

const LiveSupportPage = () => {
    const { authToken, dbUser } = useAuth();
    const { data: conversations, loading, request: refetch } = useApi('/admin/support/conversations');
    const [selectedConvoId, setSelectedConvoId] = useState(null);
    const [messages, setMessages] = useState([]);
    const ws = useRef(null);
    const messagesEndRef = useRef(null);

    // [THE FIX - Step 1] Define selectedConvo BEFORE it is used in any hooks.
    const selectedConvo = useMemo(() => {
        if (!conversations || !selectedConvoId) return null;
        return conversations.find(c => c.id === selectedConvoId);
    }, [conversations, selectedConvoId]);

    // This effect populates messages correctly when a conversation is selected.
    useEffect(() => {
        if (selectedConvo) {
            setMessages(selectedConvo.messages || []);
        } else {
            setMessages([]);
        }
    }, [selectedConvo]);

    // [THE FIX - Step 2] Use a ref to allow the WebSocket to access the current convo ID
    // without needing to re-establish the connection every time it changes.
    const selectedConvoIdRef = useRef(selectedConvoId);
    useEffect(() => {
        selectedConvoIdRef.current = selectedConvoId;
    }, [selectedConvoId]);


    // This effect manages the WebSocket connection.
    useEffect(() => {
        if (!authToken) return;

        const wsUrl = process.env.REACT_APP_API_BASE_URL.replace(/^http/, 'ws');
        ws.current = new WebSocket(`${wsUrl}/chat/ws?token=${authToken}`);

        ws.current.onopen = () => console.log("Admin WebSocket connected");
        ws.current.onclose = () => console.log("Admin WebSocket disconnected");

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // Use the ref to get the most up-to-date selected conversation ID
            if (data.type === 'new_message' && data.payload.conversation_id === selectedConvoIdRef.current) {
                setMessages(prev => [...prev, data.payload]);
            } else if (data.type === 'admin_notification' || data.type === 'new_message') {
                // If a message arrives for any conversation, refetch the list to show an indicator
                refetch();
            }
        };

        // Cleanup function
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [authToken, refetch]); // This effect only re-runs if the auth token changes.

    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);


    const handleSend = (e) => {
        e.preventDefault();
        const input = e.target.elements.message;
        if (!input.value.trim() || !selectedConvo) return;

        ws.current.send(JSON.stringify({
            conversation_id: selectedConvo.id,
            content: input.value,
        }));
        input.value = '';
    };

    return (
        <DashboardLayout pageTitle="Live Support Center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[80vh]">
                {/* Conversations List */}
                <div className="md:col-span-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg flex flex-col">
                    <h2 className="p-4 font-semibold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800">Open Tickets</h2>
                    <div className="overflow-y-auto">
                        {loading && <div className="p-4"><Spinner/></div>}
                        {conversations?.map(convo => (
                            <button
                                key={convo.id}
                                onClick={() => setSelectedConvoId(convo.id)}
                                className={`w-full text-left p-4 border-b border-neutral-200 dark:border-neutral-800 transition-colors ${
                                    selectedConvoId === convo.id ? 'bg-primary/10' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                }`}
                            >
                                <p className="font-semibold text-neutral-900 dark:text-white">{convo.user.email}</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">{format(new Date(convo.created_at), 'Pp')}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="md:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg flex flex-col">
                    {selectedConvo ? (
                        <>
                            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                                <h3 className="font-semibold text-neutral-900 dark:text-white">Chat with {selectedConvo.user.email}</h3>
                            </div>
                            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.sender_id === dbUser.id ? 'justify-end' : 'justify-start'}`}>
                                        <p className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${msg.sender_id === dbUser.id ? 'bg-primary text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white'}`}>{msg.content}</p>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                                <form onSubmit={handleSend} className="flex items-center space-x-2">
                                    <input name="message" placeholder="Type your message..." className="flex-grow bg-neutral-100 dark:bg-neutral-800 rounded-full px-4 py-2 text-neutral-900 dark:text-white" />
                                    <button type="submit" className="p-2 bg-primary rounded-full text-white"><PaperAirplaneIcon className="h-5 w-5" /></button>
                                </form>
                            </div>
                        </>
                    ) : (
                         <div className="flex justify-center items-center h-full text-neutral-500 dark:text-neutral-400">Select a conversation to begin.</div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default LiveSupportPage;