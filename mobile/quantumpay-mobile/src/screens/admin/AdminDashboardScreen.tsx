import React from 'react';
import { View, Text, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { styled } from 'nativewind';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import useApi from '../../hooks/useApi';
import { UserGroupIcon, DocumentCheckIcon, ShieldExclamationIcon, CurrencyDollarIcon } from 'react--native-heroicons/outline';
import Spinner from '../../components/common/Spinner';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledScrollView = styled(ScrollView);

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminDashboard'>;

const StatCard = ({ title, value, isLoading }) => (
    <StyledView className="bg-neutral-900 p-4 rounded-xl flex-1 items-center">
        {isLoading ? (
             <StyledView className="h-12 w-24 bg-neutral-700 rounded-md animate-pulse" />
        ) : (
            <>
                <StyledText className="text-neutral-400 text-sm">{title}</StyledText>
                <StyledText className="text-white text-3xl font-bold">{value}</StyledText>
            </>
        )}
    </StyledView>
);

const ActionButton = ({ label, icon: Icon, onPress }) => (
     <StyledPressable onPress={onPress} className="bg-neutral-900 p-6 rounded-2xl items-center justify-center space-y-2 active:bg-neutral-800 border border-neutral-800">
        <Icon color="#6D28D9" size={32} />
        <StyledText className="text-white font-bold text-base">{label}</StyledText>
    </StyledPressable>
);


const AdminDashboardScreen = ({ navigation }: Props) => {
    const { data: stats, loading, error } = useApi('/admin/dashboard-stats');

    return (
        <StyledSafeAreaView className="flex-1 bg-neutral-950">
            <StyledScrollView>
                <StyledView className="p-6">
                    <StyledText className="text-white text-3xl font-bold font-display">Admin Control Panel</StyledText>
                    <StyledText className="text-neutral-400 mt-1">Platform-wide overview and management.</StyledText>
                </StyledView>

                {/* Stats */}
                <StyledView className="px-6 flex-row space-x-4">
                    <StatCard title="Total Users" value={stats?.total_users?.toLocaleString() || '...'} isLoading={loading} />
                    <StatCard title="Pending KYC" value={stats?.pending_kyc_count ?? '...'} isLoading={loading} />
                </StyledView>
                 <StyledView className="px-6 flex-row space-x-4 mt-4">
                    <StatCard title="Volume (30d)" value={`$${stats?.total_volume_30d_usd?.toLocaleString() || '...'}`} isLoading={loading} />
                    <StatCard title="Open Disputes" value={stats?.open_disputes_count ?? '...'} isLoading={loading} />
                </StyledView>

                {/* Main Actions */}
                <StyledView className="p-6 mt-4 grid grid-cols-2 gap-4">
                     <ActionButton label="Manage Users" icon={UserGroupIcon} onPress={() => navigation.navigate('ManageUsers')} />
                     <ActionButton label="KYC Approvals" icon={DocumentCheckIcon} onPress={() => navigation.navigate('KYCApprovals')} />
                </StyledView>

            </StyledScrollView>
        </StyledSafeAreaView>
    );
};

export default AdminDashboardScreen;