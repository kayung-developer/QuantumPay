import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useApi from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import { format } from 'date-fns';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

const LiveSupportPage = () => {
    const { authToken, dbUser } = useAuth();
    const { data: conversations, loading, request: refetch } = useApi('/admin/support/conversations');
    const [selectedConvo, setSelectedConvo] = useState(null);
    const [messages, setMessages] = useState([]);
    const ws = useRef(null);

    useEffect(() => {
        if (!authToken) return;
        const wsUrl = process.env.REACT_APP_API_BASE_URL.replace(/^http/, 'ws');
        ws.current = new WebSocket(`${wsUrl}/chat/ws?token=${authToken}`);
        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'new_message' && data.payload.conversation_id === selectedConvo?.id) {
                setMessages(prev => [...prev, data.payload]);
            } else if (data.type === 'admin_notification') {
                refetch(); // New message in a different convo, so refetch the list
            }
        };
        return () => ws.current.close();
    }, [authToken, selectedConvo]);

    useEffect(() => {
        if (selectedConvo) {
            setMessages(selectedConvo.messages);
        }
    }, [selectedConvo]);

    const handleSend = (e) => {
        e.preventDefault();
        const input = e.target.elements.message;
        ws.current.send(JSON.stringify({ conversation_id: selectedConvo.id, content: input.value }));
        input.value = '';
    };

    return (
        <DashboardLayout pageTitle="Live Support Center">
            <div className="grid grid-cols-3 gap-6 h-[80vh]">
                {/* Conversations List */}
                <div className="col-span-1 bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col">
                    <h2 className="p-4 font-semibold text-white border-b border-neutral-800">Open Tickets</h2>
                    <div className="overflow-y-auto">
                        {loading && <Spinner/>}
                        {conversations?.map(convo => (
                            <button key={convo.id} onClick={() => setSelectedConvo(convo)} className={`w-full text-left p-4 border-b border-neutral-800 ${selectedConvo?.id === convo.id ? 'bg-primary/20' : 'hover:bg-neutral-800'}`}>
                                <p className="font-semibold text-white">{convo.user.email}</p>
                                <p className="text-xs text-neutral-400">{format(new Date(convo.created_at), 'Pp')}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="col-span-2 bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col">
                    {selectedConvo ? (
                        <>
                            <div className="p-4 border-b border-neutral-800">
                                <h3 className="font-semibold text-white">Chat with {selectedConvo.user.email}</h3>
                            </div>
                            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.sender_id === dbUser.id ? 'justify-end' : 'justify-start'}`}>
                                        <p className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${msg.sender_id === dbUser.id ? 'bg-primary text-white' : 'bg-neutral-800'}`}>{msg.content}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t border-neutral-700">
                                <form onSubmit={handleSend} className="flex items-center space-x-2">
                                    <input name="message" placeholder="Type your message..." className="flex-grow bg-neutral-800 rounded-full px-4 py-2" />
                                    <button type="submit" className="p-2 bg-primary rounded-full text-white"><PaperAirplaneIcon className="h-5 w-5" /></button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex justify-center items-center h-full text-neutral-500">Select a conversation to begin.</div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default LiveSupportPage;