import React, { useState } from 'react';
import { View, Text, Alert, Linking } from 'react-native';
import Modal from '../common/Modal.native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useApiPost } from '../../hooks/useApi';
import StyledTextInput from '../common/StyledTextInput';
import StyledButton from '../common/StyledButton';
import toast from 'react-hot-toast/mobile';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

const RejectionSchema = Yup.object().shape({
    rejection_reason: Yup.string().min(10, 'Reason must be at least 10 characters').required('A reason is required to reject.'),
});

interface Props {
    isOpen: boolean;
    onClose: () => void;
    kycRecord: any; // Use a more specific type if available
    onReviewed: () => void; // Callback to refresh the list
}

const KYCReviewModal = ({ isOpen, onClose, kycRecord, onReviewed }: Props) => {
    const [isRejecting, setIsRejecting] = useState(false);
    const { post: reviewKyc, loading } = useApiPost(`/admin/kyc/review/${kycRecord?.id}`, { method: 'PUT' });

    const handleApprove = async () => {
        const result = await reviewKyc({ status: 'verified' });
        if (result.success) {
            toast.success("KYC record approved successfully.");
            onReviewed();
            onClose();
        }
    };

    const handleReject = async (values: { rejection_reason: string }) => {
        const payload = { status: 'rejected', rejection_reason: values.rejection_reason };
        const result = await reviewKyc(payload);
        if (result.success) {
            toast.success("KYC record rejected.");
            onReviewed();
            onClose();
        }
    };

    // Reset internal state when the modal is closed
    React.useEffect(() => {
        if (!isOpen) {
            setIsRejecting(false);
        }
    }, [isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Review KYC: ${kycRecord?.document_type}`}
        >
            <StyledView className="space-y-4">
                {/* Details Section */}
                <StyledView className="p-4 bg-neutral-900 rounded-lg">
                    <StyledText className="text-neutral-400 text-sm">User Email</StyledText>
                    <StyledText className="text-white font-semibold">{kycRecord?.user.email}</StyledText>
                    <StyledText className="text-neutral-400 text-sm mt-2">Document Type</StyledText>
                    <StyledText className="text-white font-semibold">{kycRecord?.document_type}</StyledText>
                </StyledView>

                <StyledButton
                    label="View Submitted Document"
                    onPress={() => Linking.openURL(kycRecord?.document_url)}
                    variant="outline"
                />

                {/* Actions Section */}
                <StyledView className="pt-4 border-t border-neutral-700">
                    {!isRejecting ? (
                         <StyledView className="flex-row justify-end space-x-3">
                            <StyledButton label="Reject" onPress={() => setIsRejecting(true)} variant="secondary" />
                            <StyledButton label="Approve" onPress={handleApprove} isLoading={loading} />
                        </StyledView>
                    ) : (
                        <Formik
                            initialValues={{ rejection_reason: '' }}
                            validationSchema={RejectionSchema}
                            onSubmit={handleReject}
                        >
                            {({ handleSubmit, ...formikProps }) => (
                                <StyledView>
                                    <StyledTextInput label="Reason for Rejection" name="rejection_reason" {...formikProps} multiline />
                                    <StyledView className="flex-row justify-end space-x-3 mt-4">
                                        <StyledButton label="Cancel" onPress={() => setIsRejecting(false)} variant="secondary" />
                                        <StyledButton label="Confirm Rejection" onPress={handleSubmit} isLoading={loading} variant="primary" />
                                    </StyledView>
                                </StyledView>
                            )}
                        </Formik>
                    )}
                </StyledView>
            </StyledView>
        </Modal>
    );
};

export default KYCReviewModal;