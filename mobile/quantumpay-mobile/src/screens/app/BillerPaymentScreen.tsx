import React, { useState } from 'react';
import { View, Text, SafeAreaView, Pressable, Alert } from 'react-native';
import { styled } from 'nativewind';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BillerStackParamList } from '../../navigation/BillerNavigator';
import { useApiPost } from '../../hooks/useApi';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import StyledButton from '../../components/common/StyledButton';
import StyledTextInput from '../../components/common/StyledTextInput';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

type Props = NativeStackScreenProps<BillerStackParamList, 'BillerPayment'>;

const BillerPaymentScreen = ({ route, navigation }: Props) => {
    const { biller } = route.params;
    const [customerName, setCustomerName] = useState('');

    const { post: validateCustomer, loading: validating } = useApiPost('/bills/validate-customer');
    const { post: payBill, loading: paying } = useApiPost('/bills/pay');

    const formik = useFormik({
        initialValues: { customer_identifier: '', amount: '' },
        validationSchema: Yup.object().shape({
            customer_identifier: Yup.string().required('This field is required'),
            amount: Yup.number().positive('Amount must be positive').required('Amount is required'),
        }),
        onSubmit: async (values) => {
            const payload = {
                biller_id: biller.id,
                biller_category: biller.category,
                provider_name: biller.provider,
                customer_identifier: values.customer_identifier,
                amount: parseFloat(values.amount),
            };
            const result = await payBill(payload);
            if (result.success) {
                Alert.alert("Payment Successful", `Your payment of ${values.amount} NGN to ${biller.name} was successful.`);
                navigation.popToTop(); // Go back to the Biller Hub home
            } else {
                 Alert.alert("Payment Failed", result.error?.message || "An unexpected error occurred.");
            }
        },
    });

    const handleValidate = async () => {
        const identifier = formik.values.customer_identifier;
        if (!identifier) return;

        const result = await validateCustomer({
            biller_id: biller.id,
            customer_id: identifier,
            provider_name: biller.provider,
        });

        if (result.success && result.data.status === 'success') {
            setCustomerName(result.data.name);
        } else {
            setCustomerName(''); // Clear on failure
            Alert.alert("Validation Failed", result.data.message || "Could not validate customer details.");
        }
    };

    return (
         <StyledSafeAreaView className="flex-1 bg-neutral-950">
            <StyledView className="flex-row items-center p-4">
                <StyledPressable onPress={() => navigation.goBack()} className="p-2"><ArrowLeftIcon color="white" size={24} /></StyledPressable>
                <StyledText className="text-white text-xl font-bold ml-4">{biller.name}</StyledText>
            </StyledView>

            <StyledView className="p-6 space-y-4">
                <StyledTextInput
                    label={biller.category === 'tv' ? 'Smartcard Number' : 'Phone Number'}
                    value={formik.values.customer_identifier}
                    onChangeText={formik.handleChange('customer_identifier')}
                    onBlur={biller.requires_validation ? handleValidate : formik.handleBlur('customer_identifier')}
                    error={formik.touched.customer_identifier ? formik.errors.customer_identifier : undefined}
                    keyboardType={biller.category === 'airtime' ? 'phone-pad' : 'number-pad'}
                />

                {validating && <StyledText className="text-neutral-400 text-sm">Validating...</StyledText>}

                {customerName && !validating && (
                    <StyledView className="p-3 bg-green-900/50 rounded-lg">
                        <StyledText className="text-green-300 text-center font-semibold">{customerName}</StyledText>
                    </StyledView>
                )}

                <StyledTextInput
                    label="Amount"
                    value={formik.values.amount}
                    onChangeText={formik.handleChange('amount')}
                    onBlur={formik.handleBlur('amount')}
                    error={formik.touched.amount ? formik.errors.amount : undefined}
                    keyboardType="numeric"
                />

                <StyledView className="pt-4">
                    <StyledButton
                        label="Pay"
                        onPress={() => formik.handleSubmit()}
                        isLoading={paying}
                        disabled={validating || (biller.requires_validation && !customerName)}
                    />
                </StyledView>
            </StyledView>
        </StyledSafeAreaView>
    );
};

export default BillerPaymentScreen;