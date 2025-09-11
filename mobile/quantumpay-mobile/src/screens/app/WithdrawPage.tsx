import React, { useState } from 'react';
import { View, Text, SafeAreaView, FlatList, Pressable } from 'react-native';
import { styled } from 'nativewind';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { PlusIcon } from 'react-native-heroicons/outline';
import useApi from '../../hooks/useApi';
import Spinner from '../../components/common/Spinner';
import AddBankAccountModal from '../../components/payouts/AddBankAccountModal';
import PayoutConfirmationModal from '../../components/payouts/PayoutConfirmationModal'; // We will create this

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

// Assuming a navigator exists that can navigate here
type Props = {};

const WithdrawPage = ({ navigation }: any) => {
    // Assuming an endpoint exists to get saved recipient accounts
    const { data: savedAccounts, loading, error, request: refetch } = useApi('/payouts/recipients');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);

    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        refetch();
    };

    const renderItem = ({ item }) => (
        <StyledPressable onPress={() => setSelectedAccount(item)} className="bg-neutral-900 p-4 rounded-xl mb-3 active:bg-neutral-800">
            <StyledText className="text-white font-bold">{item.bank_name}</StyledText>
            <StyledText className="text-neutral-300">{item.account_name}</StyledText>
            <StyledText className="text-neutral-400 mt-1">...{item.account_number_mask} ({item.currency})</StyledText>
        </StyledPressable>
    );

    return (
        <StyledSafeAreaView className="flex-1 bg-neutral-950">
            <StyledView className="flex-row items-center justify-between p-4">
                 <StyledView className="flex-row items-center">
                    <StyledPressable onPress={() => navigation.goBack()} className="p-2"><ArrowLeftIcon color="white" size={24} /></StyledPressable>
                    <StyledText className="text-white text-xl font-bold ml-4">Withdraw to Bank</StyledText>
                 </StyledView>
                 <StyledPressable onPress={() => setIsAddModalOpen(true)} className="p-2">
                    <PlusIcon color="white" size={24} />
                 </StyledPressable>
            </StyledView>

            {loading && <Spinner />}

            <FlatList
                data={savedAccounts || []}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 24 }}
                 ListHeaderComponent={<StyledText className="text-neutral-400 text-sm px-2 mb-2">Select a saved account to withdraw to, or add a new one.</StyledText>}
                 ListEmptyComponent={
                    <StyledView className="items-center py-20">
                        <StyledText className="text-neutral-500">No bank accounts added yet.</StyledText>
                    </StyledView>
                 }
            />

            <AddBankAccountModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddSuccess}
            />

            {selectedAccount && (
                <PayoutConfirmationModal
                    isOpen={!!selectedAccount}
                    onClose={() => setSelectedAccount(null)}
                    account={selectedAccount}
                />
            )}
        </StyledSafeAreaView>
    );
};

export default WithdrawPage;