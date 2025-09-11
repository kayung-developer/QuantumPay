import React, { useState } from 'react';
import { View, Text, SafeAreaView, FlatList, Pressable } from 'react-native';
import { styled } from 'nativewind';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import useApi from '../../hooks/useApi';
import Spinner from '../../components/common/Spinner';
import { format, parseISO } from 'date-fns';
import Button from '../../components/common/Button';
import KYCReviewModal from '../../components/admin/KYCReviewModal'; // <-- NEW IMPORT

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

type Props = NativeStackScreenProps<AdminStackParamList, 'KYCApprovals'>;

const KYCItem = ({ item, onReview }) => (
    <StyledView className="bg-neutral-900 p-4 rounded-xl mb-3">
        <StyledView className="flex-row justify-between items-start">
            <StyledView className="flex-1">
                <StyledText className="text-white font-semibold">{item.user.email}</StyledText>
                <StyledText className="text-neutral-400 text-sm mt-1">{item.document_type} ({item.country_code})</StyledText>
            </StyledView>
            <StyledView className="items-end">
                 <Button onPress={() => onReview(item)} size="sm">Review</Button>
            </StyledView>
        </StyledView>
        <StyledText className="text-neutral-500 text-xs mt-2">Submitted: {format(parseISO(item.submitted_at), 'Pp')}</StyledText>
    </StyledView>
);

const KYCApprovalScreen = ({ navigation }: Props) => {
    const { data: kycRequests, loading, error, request: refetch } = useApi('/admin/kyc/pending');

    // State for managing the modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const handleReview = (kycRecord) => {
        setSelectedRecord(kycRecord);
        setIsModalOpen(true);
    };

    const handleReviewed = () => {
        // This is the callback after a successful review. We just refetch the list.
        refetch();
    };

    return (
        <StyledSafeAreaView className="flex-1 bg-neutral-950">
            <StyledView className="flex-row items-center p-4">
                <StyledPressable onPress={() => navigation.goBack()} className="p-2"><ArrowLeftIcon color="white" size={24} /></StyledPressable>
                <StyledText className="text-white text-xl font-bold ml-4">KYC Approval Queue</StyledText>
            </StyledView>

            {loading && !kycRequests && <Spinner />}

            <FlatList
                data={kycRequests || []}
                renderItem={({ item }) => <KYCItem item={item} onReview={handleReview} />}
                keyExtractor={(item) => item.id}
                onRefresh={refetch}
                refreshing={loading}
                contentContainerStyle={{ paddingHorizontal: 24 }}
                 ListEmptyComponent={
                    <StyledView className="items-center py-20">
                        {!loading && <StyledText className="text-neutral-500">The KYC queue is empty. Great job!</StyledText>}
                    </StyledView>
                 }
            />

            {/* Render the modal when a record is selected */}
            {selectedRecord && (
                <KYCReviewModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    kycRecord={selectedRecord}
                    onReviewed={handleReviewed}
                />
            )}
        </StyledSafeAreaView>
    );
};

export default KYCApprovalScreen;