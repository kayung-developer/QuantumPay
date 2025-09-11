import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, SafeAreaView, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useAppStore } from '../../store/authStore';
import { styled } from 'nativewind';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WalletsStackParamList } from '../../navigation/WalletsNavigator';
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from 'react-native-heroicons/outline';
import { useApiPost } from '../../hooks/useApi'; // For fetching rates

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

type Props = NativeStackScreenProps<WalletsStackParamList, 'WalletsList'>;

interface Wallet {
    id: string;
    currency_code: string;
    balance: number;
}

const WalletListItem = ({ item, onPress }: { item: Wallet, onPress: () => void }) => (
    <StyledPressable onPress={onPress} className="bg-neutral-900 p-4 rounded-2xl flex-row justify-between items-center mb-4 active:bg-neutral-800">
        <StyledView className="flex-row items-center">
            <StyledView className="w-12 h-12 bg-primary/20 rounded-full items-center justify-center">
                <StyledText className="text-primary-light font-bold text-lg">{item.currency_code}</StyledText>
            </StyledView>
            <StyledView className="ml-4">
                <StyledText className="text-white font-bold text-lg">{item.currency_code} Wallet</StyledText>
                <StyledText className="text-neutral-400">Tap to view history</StyledText>
            </StyledView>
        </StyledView>
        <StyledText className="text-white font-semibold text-lg">
            {new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(item.balance)}
        </StyledText>
    </StyledPressable>
);

const WalletsScreen = ({ navigation }: Props) => {
    const wallets = useAppStore(state => state.wallets);
    const { post: fetchRates, loading: ratesLoading } = useApiPost('/forex/batch-rates');
    const [liveRates, setLiveRates] = useState<Record<string, number> | null>(null);

    // Effect to fetch live rates whenever the user's wallets change
    useEffect(() => {
        if (wallets && wallets.length > 0) {
            const currencyCodes = wallets.map(w => w.currency_code);
            const getRates = async () => {
                const result = await fetchRates({
                    currencies: currencyCodes,
                    base_currency: "USD" // Fetch all rates against USD
                });
                if (result.success) {
                    setLiveRates(result.data.rates);
                }
            };
            getRates();
        }
    }, [wallets]);

    // Calculate total portfolio value in USD using the fetched live rates
    const totalPortfolioValueUSD = useMemo(() => {
        if (!liveRates || wallets.length === 0) {
            return null; // Return null to indicate that the calculation is not ready
        }

        return wallets.reduce((total, wallet) => {
            // Convert each wallet balance to the base currency (USD)
            const rate = liveRates[wallet.currency_code];
            // The rate from the API is how many of the target currency you get for 1 USD.
            // So, to convert a foreign currency to USD, you divide.
            if (rate && rate > 0) {
                 return total + (wallet.balance / rate);
            }
            if (wallet.currency_code === "USD") {
                return total + wallet.balance;
            }
            return total;
        }, 0);
    }, [wallets, liveRates]);

    const renderTotalValue = () => {
        if (ratesLoading || totalPortfolioValueUSD === null) {
            return (
                <StyledView className="h-10 w-48 bg-neutral-800 rounded-md animate-pulse mt-1" />
            );
        }
        return (
             <StyledText className="text-white text-4xl font-bold mt-1">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalPortfolioValueUSD)}
            </StyledText>
        );
    };

    return (
        <StyledSafeAreaView className="flex-1 bg-neutral-950">
            <StyledView className="p-6">
                <StyledText className="text-neutral-400">Total Portfolio Value (USD Equiv.)</StyledText>
                {renderTotalValue()}
            </StyledView>

            <StyledView className="flex-row px-6 pb-6 space-x-4">
                <StyledPressable className="flex-1 bg-primary flex-row items-center justify-center p-4 rounded-xl space-x-2">
                    <ArrowDownTrayIcon color="white" size={20} />
                    <StyledText className="text-white font-bold">Deposit</StyledText>
                </StyledPressable>
                <StyledPressable className="flex-1 bg-neutral-800 flex-row items-center justify-center p-4 rounded-xl space-x-2">
                    <ArrowUpTrayIcon color="white" size={20} />
                    <StyledText className="text-white font-bold">Withdraw</StyledText>
                </StyledPressable>
            </StyledView>

            <FlatList
                data={wallets}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <WalletListItem
                        item={item}
                        onPress={() => navigation.navigate('WalletDetail', { walletId: item.id, currencyCode: item.currency_code })}
                    />
                )}
                contentContainerStyle={{ paddingHorizontal: 24 }}
                ListHeaderComponent={<StyledText className="text-white text-xl font-bold mb-4">Your Wallets</StyledText>}
                ListEmptyComponent={
                    <StyledView className="items-center py-10">
                        <StyledText className="text-neutral-500">No wallets found.</StyledText>
                    </StyledView>
                }
            />
        </StyledSafeAreaView>
    );
};

export default WalletsScreen;