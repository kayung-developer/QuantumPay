import React from 'react';
import { View, Text, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useApiPost } from '../../hooks/useApi';
import StyledTextInput from '../common/StyledTextInput';
import StyledButton from '../common/StyledButton';
import { useAppStore } from '../../store/authStore';
import toast from 'react-hot-toast/mobile';
import Modal from '../common/Modal.native'; // <-- CORRECT: Import our custom native modal

// Validation schema for the 6-digit TOTP code
const DisableSchema = Yup.object().shape({
    totp_code: Yup.string()
        .matches(/^[0-9]{6}$/, 'Must be a 6-digit code from your authenticator app')
        .required('The authentication code is required'),
});

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const Disable2FAModal = ({ isOpen, onClose }: Props) => {
    // Hook to call the backend endpoint
    const { post: disable2FA, loading } = useApiPost('/users/2fa/disable');
    // Hook to refresh the user's data from the backend after a successful change
    const fetchDbUser = useAppStore(state => state.fetchAppData);

    const handleSubmit = async (values: { totp_code: string }) => {
        const result = await disable2FA(values);

        if (result.success) {
            // Provide clear, non-blocking feedback
            toast.success("Two-Factor Authentication has been disabled.");

            // Refresh the user's data from the server to update the UI
            fetchDbUser();

            // Close the modal
            onClose();
        } else {
            // The useApiPost hook already shows a toast, but we can also
            // use a more prominent Alert for critical security failures.
            Alert.alert(
                "Verification Failed",
                result.error?.message || "The code was incorrect. Please try again."
            );
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Disable Two-Factor Authentication"
        >
            <View>
                <Text style={{ color: '#CBD5E1', marginBottom: 20, lineHeight: 20 }}>
                    For your security, please enter the 6-digit code from your authenticator app to confirm you want to disable 2FA.
                </Text>

                <Formik
                    initialValues={{ totp_code: '' }}
                    validationSchema={DisableSchema}
                    onSubmit={handleSubmit}
                >
                    {({ handleChange, handleBlur, handleSubmit: submitForm, values, errors, touched }) => (
                        <View>
                            <StyledTextInput
                                label="6-Digit Authentication Code"
                                value={values.totp_code}
                                onChangeText={handleChange('totp_code')}
                                onBlur={handleBlur('totp_code')}
                                error={touched.totp_code ? errors.totp_code : undefined}
                                keyboardType="numeric"
                                maxLength={6}
                                autoFocus={true} // Automatically focus the input when the modal opens
                            />

                            <View style={{ marginTop: 24, flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                                <StyledButton label="Cancel" onPress={onClose} variant="secondary" />
                                <StyledButton
                                    label="Confirm & Disable"
                                    onPress={() => submitForm()}
                                    isLoading={loading}
                                    variant="primary" // Keeping it primary, can be changed to 'danger'
                                />
                            </View>
                        </View>
                    )}
                </Formik>
            </View>
        </Modal>
    );
};

export default Disable2FAModal;