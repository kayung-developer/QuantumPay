import React, { useState } from 'react';
import { View, Text, SafeAreaView, Pressable, Alert } from 'react-native';
import { styled } from 'nativewind';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import { KeyIcon, DevicePhoneMobileIcon } from 'react-native-heroicons/outline';
import { Switch } from 'react-native';
import { useAppStore } from '../../store/authStore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import Disable2FAModal from '../../components/security/Disable2FAModal'; // <-- NEW IMPORT
import { haptics } from '../../lib/haptics';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

type Props = NativeStackScreenProps<ProfileStackParamList, 'Security'>;

const SecurityScreen = ({ navigation }: Props) => {
    const { dbUser } = useAppStore();
    const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);

    const handleChangePassword = () => {
        if (dbUser?.email) {
            sendPasswordResetEmail(auth, dbUser.email)
                .then(() => {
                    Alert.alert("Password Reset Email Sent", "Please check your inbox to create a new password.");
                })
                .catch((error) => {
                    Alert.alert("Error", error.message);
                });
        }
    };

    const handleToggle2FA = () => {
        haptics.medium();
        if (dbUser?.is_2fa_enabled) {
            // [THE IMPLEMENTATION] Open the disable confirmation modal
            setIsDisableModalOpen(true);

        } else {
            // Launch the 2FA setup flow
            navigation.navigate('TwoFactorSetup');
        }
    };

    return (
        <StyledSafeAreaView className="flex-1 bg-neutral-950">
             {/* Custom Header */}
            <StyledView className="flex-row items-center p-4">
                <StyledPressable onPress={() => navigation.goBack()} className="p-2"><ArrowLeftIcon color="white" size={24} /></StyledPressable>
                <StyledText className="text-white text-xl font-bold ml-4">Security Settings</StyledText>
            </StyledView>

            <StyledView className="p-6 space-y-6">
                <StyledPressable onPress={handleChangePassword} className="flex-row items-center bg-neutral-900 p-4 rounded-lg active:bg-neutral-800">
                    <KeyIcon color="#94A3B8" size={24} />
                    <StyledView className="ml-4 flex-1">
                        <StyledText className="text-white text-base">Change Password</StyledText>
                        <StyledText className="text-neutral-400 text-sm">Receive an email to reset your password</StyledText>
                    </StyledView>
                </StyledPressable>

                 <StyledView className="flex-row items-center bg-neutral-900 p-4 rounded-lg">
                    <DevicePhoneMobileIcon color="#94A3B8" size={24} />
                    <StyledView className="ml-4 flex-1">
                        <StyledText className="text-white text-base">Two-Factor Authentication</StyledText>
                        <StyledText className="text-neutral-400 text-sm">
                            {dbUser?.is_2fa_enabled ? '2FA is currently active' : 'Add an extra layer of security'}
                        </StyledText>
                    </StyledView>
                    {/* The Switch now acts as a button to launch the correct flow */}
                    <Switch
                        trackColor={{ false: "#475569", true: "#3730A3" }}
                        thumbColor={dbUser?.is_2fa_enabled ? "#6D28D9" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        // The `onValueChange` is the handler, but the visual state is from the store
                        onValueChange={handleToggle2FA}
                        value={dbUser?.is_2fa_enabled || false}
                    />
                </StyledView>
            </StyledView>

            {/* Render the new modal */}
            <Disable2FAModal
                isOpen={isDisableModalOpen}
                onClose={() => setIsDisableModalOpen(false)}
            />
        </StyledSafeAreaView>
    );
};

export default SecurityScreen;