import React from 'react';
import useApi from '../../hooks/useApi';
import Spinner from '../common/Spinner';
import { formatDistanceToNow } from 'date-fns';
import { ArrowDownCircleIcon, ArrowUpCircleIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';

// A map to associate event types with icons and colors for a rich UI
const eventMeta = {
    INVOICE_PAID: { icon: ArrowDownCircleIcon, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    PAYROLL_EXECUTED: { icon: ArrowUpCircleIcon, color: 'text-red-500', bgColor: 'bg-red-500/10' },
    EXPENSE_APPROVED: { icon: CheckBadgeIcon, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    DEFAULT: { icon: CheckBadgeIcon, color: 'text-gray-500', bgColor: 'bg-gray-500/10' },
};

const ActivityItem = ({ item }) => {
    const meta = eventMeta[item.event_type] || eventMeta.DEFAULT;
    const isExpense = item.status === 'expense';

    return (
        <li className="flex items-center space-x-4 py-3">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${meta.bgColor}`}>
                <meta.icon className={`h-5 w-5 ${meta.color}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{item.primary_text}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-600 dark:text-neutral-400 truncate">{item.secondary_text}</p>
            </div>
            <div className="text-right">
                <p className={`text-sm font-semibold ${isExpense ? 'text-red-600 dark:text-red-500' : 'text-green-600 dark:text-green-500'}`}>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: item.currency }).format(Math.abs(item.amount))}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 dark:text-neutral-500">
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                </p>
            </div>
        </li>
    );
};


const BusinessActivityFeed = () => {
    const { data: feedItems, loading, error } = useApi('/business/activity-feed');

    const renderContent = () => {
        if (loading) {
            return <div className="flex justify-center items-center h-full"><Spinner /></div>;
        }
        if (error) {
            return <p className="text-center text-sm text-red-500 dark:text-red-400 p-8">Could not load activity.</p>;
        }
        if (!feedItems || feedItems.length === 0) {
            return <p className="text-center text-sm text-neutral-500 dark:text-neutral-600 dark:text-neutral-400 p-8">No recent business activity.</p>;
        }

        return (
            <ul className="divide-y divide-neutral-200 dark:divide-neutral-200 dark:divide-neutral-800">
                {feedItems.map(item => <ActivityItem key={item.id} item={item} />)}
            </ul>
        );
    };

    return (
         <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-200 dark:border-neutral-800 rounded-lg h-full flex flex-col">
            <h3 className="p-4 font-semibold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-200 dark:border-neutral-800">
                Recent Activity
            </h3>
            <div className="flex-grow p-2">
                {renderContent()}
            </div>
        </div>
    );
};

export default BusinessActivityFeed;