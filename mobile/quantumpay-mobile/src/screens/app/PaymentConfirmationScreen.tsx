import React from 'react';
import { View, Text, SafeAreaView, Pressable, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActionsStackParamList } from '../../navigation/ActionsNavigator';
import { useAppStore } from '../../store/authStore';
import { useApiPost } from '../../hooks/useApi';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { styled } from 'nativewind';
import { ArrowLeftIcon, UserCircleIcon } from 'react-native-heroicons/solid';
import StyledButton from '../../components/common/StyledButton';
import StyledTextInput from '../../components/common/StyledTextInput';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

type Props = NativeStackScreenProps<ActionsStackParamList, 'PaymentConfirmation'>;

const PaymentConfirmationScreen = ({ route, navigation }: Props) => {
    const { recipient } = route.params;
    const wallets = useAppStore(state => state.wallets);
    const { post: sendPayment, loading } = useApiPost('/transactions/qr-payment');

    const formik = useFormik({
        initialValues: { amount: '', currency: wallets[0]?.currency_code || '', description: '' },
        validationSchema: Yup.object().shape({
            amount: Yup.number().positive('Amount must be positive').required('Amount is required'),
            currency: Yup.string().required(),
        }),
        onSubmit: async (values) => {
            const payload = {
                qr_data: recipient,
                amount: parseFloat(values.amount),
                currency: values.currency,
                description: values.description || `Payment to ${recipient.name}`,
            };
            const result = await sendPayment(payload);
            if (result.success) {
                haptics.notify('success');
                Alert.alert("Payment Sent", `You successfully paid ${values.amount} ${values.currency} to ${recipient.name}.`);
                navigation.popToTop(); // Go back to the Actions Hub
            } else {
                haptics.notify('error');
                Alert.alert("Payment Failed", result.error?.message || "An unexpected error occurred.");
            }
        },
    });

    return (
        <StyledSafeAreaView className="flex-1 bg-neutral-950">
            <StyledView className="flex-row items-center p-4">
                <StyledPressable onPress={() => navigation.goBack()} className="p-2"><ArrowLeftIcon color="white" size={24} /></StyledPressable>
                <StyledText className="text-white text-xl font-bold ml-4">Confirm Payment</StyledText>
            </StyledView>

            <StyledView className="flex-1 p-6">
                <StyledView className="flex-row items-center bg-neutral-800 p-4 rounded-xl mb-6">
                    <UserCircleIcon color="#a3a3a3" size={40} />
                    <StyledView className="ml-3">
                        <StyledText className="text-neutral-400">Paying</StyledText>
                        <StyledText className="text-white font-bold text-lg">{recipient.name}</StyledText>
                    </StyledView>
                </StyledView>

                <StyledTextInput label="Amount" value={formik.values.amount} onChangeText={formik.handleChange('amount')} keyboardType="numeric" />
                {/* A real app would have a currency picker here */}
                <StyledView className="mt-4" />
                <StyledTextInput label="Description (Optional)" value={formik.values.description} onChangeText={formik.handleChange('description')} />

                <StyledView className="mt-auto">
                    <StyledButton label={`Pay ${formik.values.amount || '...'} ${formik.values.currency}`} onPress={() => formik.handleSubmit()} isLoading={loading} />
                </StyledView>
            </StyledView>
        </StyledSafeAreaView>
    );
};

export default PaymentConfirmationScreen;