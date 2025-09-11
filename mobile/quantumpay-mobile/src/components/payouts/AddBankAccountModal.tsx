import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import Modal from '../common/Modal.native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useApiPost } from '../../hooks/useApi';
import useApi from '../../hooks/useApi';
import StyledTextInput from '../common/StyledTextInput';
import StyledButton from '../common/StyledButton';
import { Picker } from '@react-native-picker/picker';
import Spinner from '../common/Spinner';

const AddAccountSchema = Yup.object().shape({
    bank_code: Yup.string().required('Please select a bank'),
    account_number: Yup.string().matches(/^[0-9]{10}$/, 'Must be a 10-digit account number').required('Account number is required'),
});

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddBankAccountModal = ({ isOpen, onClose, onSuccess }: Props) => {
    // A real system would fetch this list from Paystack's /bank endpoint
    const { data: banks, loading: banksLoading } = useApi('/paystack/banks'); // Assuming this endpoint exists

    // This hook is for verifying the account details
    const { post: verifyAccount, loading: verifying } = useApiPost('/payouts/verify-account'); // New endpoint needed

    const { post: createRecipient, loading: creating } = useApiPost('/payouts/recipient');

    const [accountName, setAccountName] = useState('');

    const handleVerify = async (values) => {
        if (!values.bank_code || values.account_number.length !== 10) return;

        const result = await verifyAccount({
            account_number: values.account_number,
            bank_code: values.bank_code,
        });

        if (result.success && result.data.account_name) {
            setAccountName(result.data.account_name);
        } else {
            setAccountName('');
            Alert.alert("Verification Failed", "Could not verify these account details. Please check and try again.");
        }
    };

    const handleSubmit = async (values) => {
        if (!accountName) {
            Alert.alert("Error", "Please verify the account details before saving.");
            return;
        }
        const payload = {
            ...values,
            name: accountName,
            currency: 'NGN', // Assuming NGN for now
        };
        const result = await createRecipient(payload);
        if (result.success) {
            onSuccess();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Bank Account">
            <Formik
                initialValues={{ account_number: '', bank_code: '' }}
                validationSchema={AddAccountSchema}
                onSubmit={handleSubmit}
            >
                {({ handleSubmit: submitForm, ...formikProps }) => (
                    <View>
                        <Text style={{ color: '#CBD5E1', marginBottom: 16 }}>
                            Your payout account for NGN withdrawals.
                        </Text>

                        {banksLoading ? <Spinner /> : (
                             <View className="bg-neutral-800 border border-neutral-700 rounded-xl mb-4">
                                <Picker
                                    selectedValue={formikProps.values.bank_code}
                                    onValueChange={(itemValue) => formikProps.setFieldValue('bank_code', itemValue)}
                                    style={{ color: 'white' }}
                                    dropdownIconColor="white"
                                >
                                    <Picker.Item label="Select a Bank..." value="" />
                                    {banks?.map(bank => <Picker.Item key={bank.code} label={bank.name} value={bank.code} />)}
                                </Picker>
                            </View>
                        )}

                        <StyledTextInput
                            label="Account Number (10 digits)"
                            name="account_number"
                            keyboardType="number-pad"
                            maxLength={10}
                            onBlur={() => handleVerify(formikProps.values)}
                            {...formikProps}
                        />

                        {verifying && <Text className="text-neutral-400 mt-2">Verifying...</Text>}
                        {accountName && !verifying && (
                            <View className="p-3 bg-green-900/50 rounded-lg mt-2">
                                <Text className="text-green-300 text-center font-semibold">{accountName}</Text>
                            </View>
                        )}

                        <View style={{ marginTop: 24 }}>
                            <StyledButton
                                label="Save Account"
                                onPress={submitForm}
                                isLoading={creating}
                                disabled={!accountName || verifying}
                            />
                        </View>
                    </View>
                )}
            </Formik>
        </Modal>
    );
};

export default AddBankAccountModal;