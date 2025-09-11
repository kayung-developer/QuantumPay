import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { useAppStore } from '../../store/authStore';
import { styled } from 'nativewind';
import WalletCarousel from '../../components/home/WalletCarousel';
import QuickActions from '../../components/home/QuickActions';
// We will create the RecentTransactionsList component next
import RecentTransactionsList from '../../components/home/RecentTransactionsList';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledScrollView = styled(ScrollView);

const HomeScreen = () => {
    const { dbUser, wallets, transactions } = useAppStore();
    const isLoading = useAppStore(state => state.status === 'loading');

    // Get the current time to display a greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    return (
        <StyledSafeAreaView className="flex-1 bg-neutral-950">
            <StyledScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header */}
                <StyledView className="px-6 pt-4 pb-8">
                    <StyledText className="text-neutral-400 text-lg">{getGreeting()},</StyledText>
                    <StyledText className="text-white text-3xl font-bold">{dbUser?.full_name}</StyledText>
                </StyledView>

                {/* Wallet Carousel */}
                <WalletCarousel wallets={wallets} isLoading={isLoading} />

                {/* Quick Actions */}
                <StyledView className="mt-8">
                    <QuickActions />
                </StyledView>

                {/* Recent Transactions */}
                <StyledView className="mt-8 px-6">
                    <StyledText className="text-white text-xl font-bold mb-4">Recent Activity</StyledText>
                    <RecentTransactionsList transactions={transactions} isLoading={isLoading} currentUserId={dbUser?.id} />
                </StyledView>
            </StyledScrollView>
        </StyledSafeAreaView>
    );
};

export default HomeScreen;