import React, { useMemo } from 'react';
import { View, Text, SafeAreaView, FlatList, Pressable } from 'react-native';
import { useAppStore } from '../../store/authStore';
import { styled } from 'nativewind';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WalletsStackParamList } from '../../navigation/WalletsNavigator';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import RecentTransactionsList from '../../components/home/RecentTransactionsList'; // Reuse the component from the home screen

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

type Props = NativeStackScreenProps<WalletsStackParamList, 'WalletDetail'>;

const WalletDetailScreen = ({ route, navigation }: Props) => {
    const { walletId, currencyCode } = route.params;
    const { wallets, transactions, dbUser } = useAppStore();

    // Find the specific wallet from the global store
    const wallet = useMemo(() => wallets.find(w => w.id === walletId), [wallets, walletId]);

    // Filter the global transaction list to show only transactions for this wallet's currency
    const walletTransactions = useMemo(() => {
        return transactions.filter(tx => tx.currency_code === currencyCode);
    }, [transactions, currencyCode]);

    if (!wallet) {
        return (
             <StyledSafeAreaView className="flex-1 bg-neutral-950 items-center justify-center">
                <StyledText className="text-white">Wallet not found.</StyledText>
             </StyledSafeAreaView>
        )
    }

    return (
        <StyledSafeAreaView className="flex-1 bg-neutral-950">
            {/* Custom Header */}
            <StyledView className="flex-row items-center p-4">
                <StyledPressable onPress={() => navigation.goBack()} className="p-2">
                    <ArrowLeftIcon color="white" size={24} />
                </StyledPressable>
                <StyledText className="text-white text-xl font-bold ml-4">{wallet.currency_code} Wallet</StyledText>
            </StyledView>

            {/* Balance Display */}
            <StyledView className="items-center py-8">
                <StyledText className="text-neutral-400">Current Balance</StyledText>
                <StyledText className="text-white text-5xl font-bold mt-1">
                    {new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(wallet.balance)}
                </StyledText>
                 <StyledText className="text-neutral-400 text-lg">{wallet.currency_code}</StyledText>
            </StyledView>

            {/* Transaction List */}
            <FlatList
                data={walletTransactions}
                keyExtractor={(item) => item.id}
                // We can't use the exact same component as it's not a FlatList
                // So we will reuse its item component logic
                renderItem={({ item }) => (
                    // We need to create a new TransactionItem component for FlatList
                    // For now, let's just show the description
                    <StyledView className="px-6 py-4 border-b border-neutral-800">
                        <StyledText className="text-white">{item.description}</StyledText>
                    </StyledView>
                )}
                 ListHeaderComponent={<StyledText className="text-white text-xl font-bold px-6 mb-2">Transaction History</StyledText>}
                 ListEmptyComponent={
                    <StyledView className="items-center py-10">
                        <StyledText className="text-neutral-500">No transactions in this wallet yet.</StyledText>
                    </StyledView>
                 }
            />
        </StyledSafeAreaView>
    );
};

export default WalletDetailScreen;