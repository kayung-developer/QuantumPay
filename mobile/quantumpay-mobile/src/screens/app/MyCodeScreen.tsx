import React from 'react';
import { View, Text, SafeAreaView, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActionsStackParamList } from '../../navigation/ActionsNavigator';
import { useAppStore } from '../../store/authStore';
import QRCode from 'react-native-qrcode-svg';
import { styled } from 'nativewind';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

type Props = NativeStackScreenProps<ActionsStackParamList, 'MyCode'>;

const MyCodeScreen = ({ navigation }: Props) => {
    const { dbUser } = useAppStore();

    if (!dbUser) {
        // This should theoretically never happen if the user is in the app stack
        return (
            <StyledSafeAreaView className="flex-1 bg-neutral-950 items-center justify-center">
                <StyledText className="text-white">Loading user data...</StyledText>
            </StyledSafeAreaView>
        );
    }

    // Construct the data payload to be embedded in the QR code
    const qrData = JSON.stringify({
        type: "user_payment",
        user_id: dbUser.id,
        name: dbUser.full_name,
        email: dbUser.email,
    });

    return (
        <StyledSafeAreaView className="flex-1 bg-neutral-950">
            <StyledView className="p-4">
                <StyledPressable onPress={() => navigation.goBack()} className="p-2">
                    <ArrowLeftIcon color="white" size={24} />
                </StyledPressable>
            </StyledView>

            <StyledView className="flex-1 items-center justify-center p-6 -mt-12">
                <StyledView className="bg-white p-6 rounded-2xl">
                    <QRCode
                        value={qrData}
                        size={250}
                        logoBackgroundColor='transparent'
                    />
                </StyledView>

                <StyledText className="text-white text-2xl font-bold mt-8">{dbUser.full_name}</StyledText>
                <StyledText className="text-neutral-400 mt-1">Scan this code to pay me</StyledText>
            </StyledView>
        </StyledSafeAreaView>
    );
};

export default MyCodeScreen;