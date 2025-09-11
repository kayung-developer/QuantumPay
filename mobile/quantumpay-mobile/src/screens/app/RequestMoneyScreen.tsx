import React from 'react';
import { View, Text, SafeAreaView, Pressable, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActionsStackParamList } from '../../navigation/ActionsNavigator';
import { useAppStore } from '../../store/authStore';
import { useApiPost } from '../../hooks/useApi';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { styled } from 'nativewind';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import StyledButton from '../../components/common/StyledButton';
import StyledTextInput from '../../components/common/StyledTextInput';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

const RequestSchema = Yup.object().shape({
  requestee_email: Yup.string().email('Invalid email').required('Email is required'),
  amount: Yup.number().positive('Amount must be positive').required('Amount is required'),
  currency: Yup.string().required(),
  notes: Yup.string(),
});

type Props = NativeStackScreenProps<ActionsStackParamList, 'RequestMoney'>;

const RequestMoneyScreen = ({ navigation }: Props) => {
    const wallets = useAppStore(state => state.wallets);
    const { post: sendRequest, loading } = useApiPost('/transactions/request-payment');

    const formik = useFormik({
        initialValues: { requestee_email: '', amount: '', currency: wallets[0]?.currency_code || '', notes: '' },
        validationSchema: RequestSchema,
        onSubmit: async (values, { resetForm }) => {
            const result = await sendRequest(values);
            if (result.success) {
                Alert.alert("Request Sent", `Your request for ${values.amount} ${values.currency} has been sent to ${values.requestee_email}.`);
                resetForm();
                navigation.goBack();
            } else {
                 Alert.alert("Request Failed", result.error?.message || "An unexpected error occurred.");
            }
        },
    });

    return (
        <StyledSafeAreaView className="flex-1 bg-neutral-950">
            <StyledView className="flex-row items-center p-4">
                <StyledPressable onPress={() => navigation.goBack()} className="p-2"><ArrowLeftIcon color="white" size={24} /></StyledPressable>
                <StyledText className="text-white text-xl font-bold ml-4">Request Money</StyledText>
            </StyledView>

            <StyledView className="flex-1 p-6">
                <StyledTextInput label="Request from (Email)" value={formik.values.requestee_email} onChangeText={formik.handleChange('requestee_email')} keyboardType="email-address" autoCapitalize="none" />
                <StyledView className="mt-4" />
                <StyledTextInput label="Amount" value={formik.values.amount} onChangeText={formik.handleChange('amount')} keyboardType="numeric" />
                {/* A real app would have a currency picker here */}
                <StyledView className="mt-4" />
                <StyledTextInput label="Notes (Optional)" value={formik.values.notes} onChangeText={formik.handleChange('notes')} />
                <StyledView className="mt-8">
                    <StyledButton label="Send Request" onPress={() => formik.handleSubmit()} isLoading={loading} />
                </StyledView>
            </StyledView>
        </StyledSafeAreaView>
    );
};

export default RequestMoneyScreen;