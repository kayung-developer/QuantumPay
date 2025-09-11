import React from 'react';
import { View, Text, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { styled } from 'nativewind';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MerchantStackParamList } from '../../navigation/MerchantNavigator';
import useApi from '../../hooks/useApi';
import { ChartPieIcon, ShoppingBagIcon, CalculatorIcon, ClipboardDocumentListIcon } from 'react-native-heroicons/outline';
import Spinner from '../../components/common/Spinner';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledScrollView = styled(ScrollView);

type Props = NativeStackScreenProps<MerchantStackParamList, 'MerchantDashboard'>;

const StatCard = ({ title, value, icon: Icon, isLoading }) => (
    <StyledView className="bg-neutral-900 p-4 rounded-xl flex-1">
        {isLoading ? (
            <StyledView className="space-y-2">
                <StyledView className="h-6 w-6 bg-neutral-700 rounded-md" />
                <StyledView className="h-4 w-24 bg-neutral-700 rounded-md" />
                <StyledView className="h-8 w-32 bg-neutral-700 rounded-md" />
            </StyledView>
        ) : (
            <>
                <Icon color="#94A3B8" size={24} />
                <StyledText className="text-neutral-400 mt-2">{title}</StyledText>
                <StyledText className="text-white text-2xl font-bold">{value}</StyledText>
            </>
        )}
    </StyledView>
);

const ActionButton = ({ label, icon: Icon, onPress }) => (
     <StyledPressable onPress={onPress} className="bg-primary p-6 rounded-2xl items-center justify-center space-y-2 active:bg-primary-dark">
        <Icon color="white" size={32} />
        <StyledText className="text-white font-bold text-lg">{label}</StyledText>
    </StyledPressable>
);

const MerchantDashboardScreen = ({ navigation }: Props) => {
    // [REAL SYSTEM] Fetch live stats from the new endpoint
    const { data: stats, loading, error } = useApi('/business/dashboard-stats');

    return (
        <StyledSafeAreaView className="flex-1 bg-neutral-950">
            <StyledScrollView>
                <StyledView className="p-6">
                    <StyledText className="text-white text-3xl font-bold font-display">Merchant Hub</StyledText>
                    <StyledText className="text-neutral-400 mt-1">Manage your business on the go.</StyledText>
                </StyledView>

                {/* Stats */}
                <StyledView className="px-6 flex-row space-x-4">
                    <StatCard
                        title={`Today's Sales (${stats?.primary_currency || '...'})`}
                        value={stats ? new Intl.NumberFormat().format(stats.total_sales_today) : '...'}
                        icon={ChartPieIcon}
                        isLoading={loading}
                    />
                    <StatCard
                        title="Today's Transactions"
                        value={stats?.transaction_count_today ?? '...'}
                        icon={ShoppingBagIcon}
                        isLoading={loading}
                    />
                </StyledView>

                {/* Main Actions */}
                <StyledView className="p-6 mt-4 space-y-4">
                    <ActionButton
                        label="Point of Sale (POS)"
                        icon={CalculatorIcon}
                        onPress={() => navigation.navigate('POS', { currency: stats?.primary_currency || 'NGN' })}
                    />
                    <ActionButton
                        label="Product Catalog"
                        icon={ClipboardDocumentListIcon}
                        onPress={() => navigation.navigate('ProductCatalog')}
                    />
                </StyledView>

            </StyledScrollView>
        </StyledSafeAreaView>
    );
};

export default MerchantDashboardScreen;