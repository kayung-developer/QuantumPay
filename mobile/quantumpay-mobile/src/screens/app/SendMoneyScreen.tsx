import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, SafeAreaView, Pressable, Alert, FlatList, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActionsStackParamList } from '../../navigation/ActionsNavigator';
import { useAppStore } from '../../store/authStore';
import { useApiPost } from '../../hooks/useApi';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { styled } from 'nativewind';
import { ArrowLeftIcon, CheckCircleIcon, UserCircleIcon, UserPlusIcon } from 'react-native-heroicons/solid';
import StyledButton from '../../components/common/StyledButton';
import StyledTextInput from '../../components/common/StyledTextInput';
import * as Contacts from 'expo-contacts';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

type Props = NativeStackScreenProps<ActionsStackParamList, 'SendMoney'>;

// Define the shape of a synced contact
interface SyncedContact {
    full_name: string;
    email: string;
    is_qpay_user: boolean;
}

const SendMoneyScreen = ({ navigation }: Props) => {
    const [recipient, setRecipient] = useState<SyncedContact | null>(null);
    const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
    const [syncedContacts, setSyncedContacts] = useState<Record<string, SyncedContact>>({});
    const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
    const wallets = useAppStore(state => state.wallets);

    const { post: syncContacts, loading: syncing } = useApiPost('/users/sync-contacts');
    const { post: sendPayment, loading: sending } = useApiPost('/transactions/p2p-transfer');

    // Effect to request permissions and fetch contacts
    useEffect(() => {
        (async () => {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status === 'granted') {
                setPermissionStatus('granted');
                const { data } = await Contacts.getContactsAsync({
                    fields: [Contacts.Fields.Emails, Contacts.Fields.Name],
                });
                if (data.length > 0) {
                    setContacts(data);
                    // Now, sync these contacts with our backend
                    const emails = data.flatMap(c => c.emails?.map(e => e.email) || []).filter(Boolean);
                    const result = await syncContacts({ emails: emails, phone_numbers: [] });
                    if (result.success) {
                        setSyncedContacts(result.data.synced_contacts);
                    }
                }
            } else {
                setPermissionStatus('denied');
            }
        })();
    }, []);

    const paymentFormik = useFormik({
        initialValues: { amount: '', currency: wallets[0]?.currency_code || '', description: '' },
        validationSchema: Yup.object().shape({
            amount: Yup.number().positive('Amount must be positive').required('Amount is required'),
        }),
        onSubmit: async (values) => {
            if (!recipient) return;
            const payload = {
                receiver_email: recipient.email,
                amount: parseFloat(values.amount),
                currency_code: values.currency,
                description: values.description,
            };
            const result = await sendPayment(payload);
            if (result.success) {
                haptics.notify('success');
                Alert.alert("Success", `Transfer to ${recipient.full_name} was successful!`);
                navigation.navigate('ActionsHub');
            }else {
                haptics.notify('error');
                Alert.alert("Transfer Failed", result.error?.message || "An error occurred.");
            }
        },
    });

    const qpayContacts = useMemo(() => {
        return contacts.map(contact => {
            const primaryEmail = contact.emails?.[0]?.email?.toLowerCase();
            const qpayInfo = primaryEmail ? syncedContacts[primaryEmail] : null;
            return {
                ...contact,
                is_qpay_user: !!qpayInfo,
                qpay_name: qpayInfo?.full_name,
            };
        }).filter(c => c.is_qpay_user); // Only show contacts who are on QuantumPay
    }, [contacts, syncedContacts]);

    // Main Render Logic
    if (recipient) {
        // --- STEP 2: PAYMENT CONFIRMATION ---
        return (
            <StyledSafeAreaView className="flex-1 bg-neutral-950">
                <StyledView className="flex-row items-center p-4">
                    <StyledPressable onPress={() => setRecipient(null)} className="p-2"><ArrowLeftIcon color="white" size={24} /></StyledPressable>
                    <StyledText className="text-white text-xl font-bold ml-4">Send Money</StyledText>
                </StyledView>
                <StyledView className="p-6">
                    <StyledView className="flex-row items-center bg-neutral-800 p-4 rounded-xl mb-6">
                        <UserCircleIcon color="#a3a3a3" size={40} />
                        <StyledView className="ml-3">
                            <StyledText className="text-white font-bold">{recipient.full_name}</StyledText>
                            <StyledText className="text-neutral-400">{recipient.email}</StyledText>
                        </StyledView>
                    </StyledView>
                    <StyledTextInput label="Amount" value={paymentFormik.values.amount} onChangeText={paymentFormik.handleChange('amount')} keyboardType="numeric" />
                    <StyledView className="mt-4"/>
                    <StyledTextInput label="Description (Optional)" value={paymentFormik.values.description} onChangeText={paymentFormik.handleChange('description')} />
                    <StyledView className="mt-8">
                        <StyledButton label={`Send ${paymentFormik.values.amount || '...'} ${paymentFormik.values.currency}`} onPress={() => paymentFormik.handleSubmit()} isLoading={sending} />
                    </StyledView>
                </StyledView>
            </StyledSafeAreaView>
        );
    }

    // --- STEP 1: RECIPIENT SELECTION ---
    return (
        <StyledSafeAreaView className="flex-1 bg-neutral-950">
            <StyledView className="flex-row items-center p-4">
                <StyledPressable onPress={() => navigation.goBack()} className="p-2"><ArrowLeftIcon color="white" size={24} /></StyledPressable>
                <StyledText className="text-white text-xl font-bold ml-4">Send Money</StyledText>
            </StyledView>

            <StyledView className="px-6 pb-4">
                <StyledTextInput label="Or enter email manually" placeholder="recipient@example.com" />
            </StyledView>

            {permissionStatus === 'pending' || syncing ? <ActivityIndicator className="mt-10" /> : null}
            {permissionStatus === 'denied' ? <StyledText className="text-center text-neutral-500 mt-10">Allow access to contacts in your phone's settings to see your friends on QuantumPay.</StyledText> : null}

            <FlatList
                data={qpayContacts}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={<StyledText className="text-neutral-400 font-semibold px-6 mb-2">Your Contacts on QuantumPay</StyledText>}
                renderItem={({ item }) => (
                    <StyledPressable
                        onPress={() => setRecipient({ full_name: item.qpay_name, email: item.emails[0].email, is_qpay_user: true })}
                        className="flex-row items-center px-6 py-3 active:bg-neutral-800"
                    >
                        <UserCircleIcon color="#a3a3a3" size={40} />
                        <StyledView className="ml-3">
                            <StyledText className="text-white font-semibold">{item.qpay_name}</StyledText>
                            <StyledText className="text-neutral-500">{item.emails[0].email}</StyledText>
                        </StyledView>
                    </StyledPressable>
                )}
            />
        </StyledSafeAreaView>
    );
};

export default SendMoneyScreen;