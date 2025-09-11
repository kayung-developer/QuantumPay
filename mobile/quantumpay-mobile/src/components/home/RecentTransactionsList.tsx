import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { styled } from 'nativewind';
import { format, parseISO } from 'date-fns';
import { ArrowDownLeftIcon, ArrowUpRightIcon, BanknotesIcon } from 'react-native-heroicons/solid';
import { useSpotlight } from 'react-native-spotlight-tour';

const StyledView = styled(View);
const StyledText = styled(Text);

interface Transaction {
    id: string;
    amount: number;
    currency_code: string;
    description: string;
    status: string;
    transaction_type: string;
    sender_id?: string;
    receiver_id?: string;
    created_at: string;
}

interface Props {
    transactions: Transaction[];
    isLoading: boolean;
    currentUserId?: string | null;
}

const transactionMetadata = {
  DEPOSIT: { icon: ArrowDownLeftIcon, color: 'text-green-400' },
  P2P_TRANSFER_SENT: { icon: ArrowUpRightIcon, color: 'text-red-400' },
  P2P_TRANSFER_RECEIVED: { icon: ArrowDownLeftIcon, color: 'text-green-400' },
  PAYMENT: { icon: BanknotesIcon, color: 'text-blue-400' },
  WITHDRAWAL: { icon: ArrowUpRightIcon, color: 'text-red-400' },
  DEFAULT: { icon: BanknotesIcon, color: 'text-neutral-400'}
};

const TransactionItem = ({ tx, currentUserId }: { tx: Transaction, currentUserId?: string | null }) => {
    const isSent = tx.sender_id === currentUserId;

    let typeKey = tx.transaction_type.toUpperCase();
    if (typeKey === 'P2P_TRANSFER') {
        typeKey = isSent ? 'P2P_TRANSFER_SENT' : 'P2P_TRANSFER_RECEIVED';
    }

    const { icon: Icon, color } = transactionMetadata[typeKey] || transactionMetadata.DEFAULT;
    const amountPrefix = isSent ? '-' : '+';
    const amountColor = isSent ? 'text-red-400' : 'text-green-400';

    return (
        <StyledView className="flex-row items-center justify-between py-4">
            <StyledView className="flex-row items-center flex-1">
                <StyledView className={`p-3 rounded-full bg-neutral-800 ${color}`}>
                    <Icon color="white" size={20} />
                </StyledView>
                <StyledView className="ml-4 flex-1">
                    <StyledText className="text-white font-semibold text-base" numberOfLines={1}>
                        {tx.description || 'Transaction'}
                    </StyledText>
                    <StyledText className="text-neutral-400 text-sm">
                        {format(parseISO(tx.created_at), 'MMM d, h:mm a')}
                    </StyledText>
                </StyledView>
            </StyledView>
            <StyledView className="items-end">
                <StyledText className={`font-bold text-base ${amountColor}`}>
                    {amountPrefix} {new Intl.NumberFormat('en-US').format(tx.amount)} {tx.currency_code}
                </StyledText>
                <StyledText className="text-neutral-500 text-xs capitalize">
                    {tx.status.toLowerCase()}
                </StyledText>
            </StyledView>
        </StyledView>
    );
};

const SkeletonItem = () => (
    <StyledView className="flex-row items-center justify-between py-4">
        <StyledView className="flex-row items-center flex-1">
            <StyledView className="h-12 w-12 rounded-full bg-neutral-800" />
            <StyledView className="ml-4 space-y-2">
                <StyledView className="h-4 w-32 bg-neutral-800 rounded-md" />
                <StyledView className="h-3 w-24 bg-neutral-800 rounded-md" />
            </StyledView>
        </StyledView>
        <StyledView className="items-end space-y-2">
            <StyledView className="h-4 w-20 bg-neutral-800 rounded-md" />
            <StyledView className="h-3 w-12 bg-neutral-800 rounded-md" />
        </StyledView>
    </StyledView>
);


const RecentTransactionsList = ({ transactions, isLoading, currentUserId }: Props) => {
    const { Spotlight } = useSpotlight('recent-activity');
    if (isLoading) {
        return (
            <StyledView>
                <SkeletonItem />
                <SkeletonItem />
                <SkeletonItem />
            </StyledView>
        );
    }

    if (transactions.length === 0) {
        return (
            <StyledView className="items-center justify-center py-10 bg-neutral-900 rounded-2xl">
                <StyledText className="text-neutral-500">No recent transactions yet.</StyledText>
            </StyledView>
        );
    }

    return (
    <Spotlight>
        <StyledView className="bg-neutral-900 rounded-2xl px-4 divide-y divide-neutral-800">
            {transactions.map(tx => (
                <TransactionItem key={tx.id} tx={tx} currentUserId={currentUserId} />
            ))}
        </StyledView>
    </Spotlight>
    );
};

export default RecentTransactionsList;