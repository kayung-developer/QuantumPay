// FILE: frontend/src/components/common/NotificationCenter.js

import React, { Fragment } from 'react';
import { useApi, useApiPost } from '../../hooks/useApi';
import { Popover, Transition } from '@headlessui/react';
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow, parseISO } from 'date-fns';

const NotificationCenter = () => {
    const { data: notifications, loading, request: refetch } = useApi('/notifications');
    const { post: markAsRead } = useApiPost();

    const unreadCount = notifications?.filter(n => !n.read).length || 0;

    const handleMarkAsRead = (id) => {
        markAsRead({}, { url: `/notifications/${id}/read` }).then(() => {
            refetch(); // Refresh the list after marking as read
        });
    };

    return (
        <Popover className="relative">
            <Popover.Button className="relative p-2 rounded-full text-neutral-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-primary">
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {unreadCount}
                    </span>
                )}
            </Popover.Button>
            <Transition as={Fragment} /* ... transition props ... */>
                <Popover.Panel className="absolute right-0 z-20 mt-2 w-80 origin-top-right rounded-md bg-white dark:bg-neutral-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-neutral-700">
                    <div className="p-4 font-semibold border-b border-neutral-700">Notifications</div>
                    <div className="max-h-96 overflow-y-auto">
                        {loading && <p className="p-4 text-center text-sm">Loading...</p>}
                        {notifications && notifications.length > 0 ? (
                            notifications.map(notif => (
                                <div key={notif.id} className={`p-4 border-b border-neutral-700 ${!notif.read ? 'bg-primary/10' : ''}`}>
                                    <p className="font-semibold text-sm text-white">{notif.title}</p>
                                    <p className="text-xs text-neutral-300">{notif.message}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-xs text-neutral-500">{formatDistanceToNow(parseISO(notif.created_at), { addSuffix: true })}</p>
                                        {!notif.read && (
                                            <button onClick={() => handleMarkAsRead(notif.id)} className="text-xs text-primary hover:underline">Mark as read</button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="p-8 text-center text-sm text-neutral-400">You have no notifications.</p>
                        )}
                    </div>
                </Popover.Panel>
            </Transition>
        </Popover>
    );
};

export default NotificationCenter;