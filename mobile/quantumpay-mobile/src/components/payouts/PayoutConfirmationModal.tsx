import React from 'react';
import { View, Text, Alert } from 'react-native';
import Modal from '../common/Modal.native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useApiPost } from '../../hooks/useApi';
import StyledTextInput from '../common/StyledTextInput';
import StyledButton from '../common/StyledButton';
import { useAppStore } from '../../store/authStore';

const PayoutSchema = Yup.object().shape({
    amount: Yup.number().positive('Amount must be positive').required('Amount is required'),
});

const PayoutConfirmationModal = ({ isOpen, onClose, account }) => {
    const { post: executePayout, loading } = useApiPost('/payouts/execute');
    const wallets = useAppStore(state => state.wallets);
    const sourceWallet = wallets.find(w => w.currency_code === account?.currency);

    const handleSubmit = async (values) => {
        const payload = {
            recipient_code: account.provider_recipient_code,
            amount: parseFloat(values.amount),
            source_currency: account.currency,
        };
        const result = await executePayout(payload);
        if (result.success) {
            Alert.alert("Withdrawal Initiated", "Your funds are on their way and should arrive in your bank account shortly.");
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Withdraw to ${account?.bank_name}`}>
            <View>
                 <View className="p-3 bg-neutral-800 rounded-lg mb-4">
                    <Text className="text-white font-semibold">{account?.account_name}</Text>
                    <Text className="text-neutral-400">...{account?.account_number_mask}</Text>
                 </View>

                <Formik
                    initialValues={{ amount: '' }}
                    validationSchema={PayoutSchema}
                    onSubmit={handleSubmit}
                >
                    {({ handleSubmit: submitForm, ...formikProps }) => (
                        <View>
                            <StyledTextInput
                                label={`Amount to Withdraw (${account?.currency})`}
                                name="amount"
                                keyboardType="numeric"
                                {...formikProps}
                            />
                            <Text className="text-neutral-500 text-xs mt-1">
                                Available Balance: {sourceWallet?.balance.toFixed(2) || '0.00'} {account?.currency}
                            </Text>
                            <View style={{ marginTop: 24 }}>
                                <StyledButton
                                    label="Confirm Withdrawal"
                                    onPress={submitForm}
                                    isLoading={loading}
                                />
                            </View>
                        </View>
                    )}
                </Formik>
            </View>
        </Modal>
    );
};

export default PayoutConfirmationModal;