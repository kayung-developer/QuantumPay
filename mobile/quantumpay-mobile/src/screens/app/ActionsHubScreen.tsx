import React from 'react';
import { View, Text, SafeAreaView, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActionsStackParamList } from '../../navigation/ActionsNavigator';
import { styled } from 'nativewind';
import { ArrowUpIcon, ArrowDownIcon, QrCodeIcon, UserIcon } from 'react-native-heroicons/outline';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

type Props = NativeStackScreenProps<ActionsStackParamList, 'ActionsHub'>;

const ActionButton = ({ icon: Icon, label, description, onPress }) => (
    <StyledPressable
        onPress={onPress}
        className="flex-row items-center bg-neutral-900 p-6 rounded-2xl border border-neutral-800 active:bg-neutral-800"
    >
        <Icon color="#6D28D9" size={32} />
        <StyledView className="ml-4">
            <StyledText className="text-white font-bold text-lg">{label}</StyledText>
            <StyledText className="text-neutral-400 mt-1">{description}</StyledText>
        </StyledView>
    </StyledPressable>
);

const ActionsHubScreen = ({ navigation }: Props) => {
    return (
        <StyledSafeAreaView className="flex-1 bg-neutral-950">
            <StyledView className="p-6">
                <StyledText className="text-white text-3xl font-bold font-display">Actions</StyledText>
                <StyledText className="text-neutral-400 mt-1">Send, request, or scan to pay in an instant.</StyledText>
            </StyledView>

            <StyledView className="flex-1 p-6 space-y-6">
                <ActionButton
                    label="Scan QR Code"
                    description="Pay a friend or merchant by scanning their code."
                    icon={QrCodeIcon}
                    onPress={() => navigation.navigate('Scan')}
                />
                <ActionButton
                    label="Show My QR Code"
                    description="Let others scan your code to pay you."
                    icon={UserIcon}
                    onPress={() => navigation.navigate('MyCode')}
                />
                <ActionButton
                    label="Send Money"
                    description="Transfer funds to any QuantumPay user."
                    icon={ArrowUpIcon}
                    onPress={() => navigation.navigate('SendMoney')}
                />
                <ActionButton
                    label="Request Money"
                    description="Request a payment from another user."
                    icon={ArrowDownIcon}
                    onPress={() => navigation.navigate('RequestMoney')}
                />
            </StyledView>
        </StyledSafeAreaView>
    );
};

export default ActionsHubScreen;