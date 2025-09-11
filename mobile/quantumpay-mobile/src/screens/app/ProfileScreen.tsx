import React from 'react';
import { View, Text, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { useAppStore } from '../../store/authStore';
import { styled } from 'nativewind';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';
import { ChevronRightIcon, ShieldCheckIcon, Cog6ToothIcon, LifebuoyIcon, ArrowRightOnRectangleIcon } from 'react-native-heroicons/outline';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledScrollView = styled(ScrollView);

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>;

const ProfileMenuItem = ({ icon: Icon, label, onPress }) => (
    <StyledPressable onPress={onPress} className="flex-row items-center bg-neutral-900 p-4 rounded-lg active:bg-neutral-800">
        <Icon color="#94A3B8" size={24} />
        <StyledText className="text-white text-base ml-4 flex-1">{label}</StyledText>
        <ChevronRightIcon color="#64748B" size={20} />
    </StyledPressable>
);

const ProfileScreen = ({ navigation }: Props) => {
    const { dbUser, logout } = useAppStore();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // The onAuthStateChanged listener will handle clearing the store
        } catch (error) {
            console.error("Failed to sign out:", error);
        }
    };

    return (
        <StyledSafeAreaView className="flex-1 bg-neutral-950">
            <StyledScrollView>
                {/* Profile Header */}
                <StyledView className="items-center p-8">
                    <StyledView className="w-24 h-24 bg-primary rounded-full items-center justify-center">
                        <StyledText className="text-white text-4xl font-bold">
                            {dbUser?.full_name ? dbUser.full_name.charAt(0) : 'U'}
                        </StyledText>
                    </StyledView>
                    <StyledText className="text-white text-2xl font-bold mt-4">{dbUser?.full_name}</StyledText>
                    <StyledText className="text-neutral-400 mt-1">{dbUser?.email}</StyledText>
                </StyledView>

                {/* Menu */}
                <StyledView className="px-6 space-y-4">
                    <ProfileMenuItem
                        label="Security"
                        icon={ShieldCheckIcon}
                        onPress={() => navigation.navigate('Security')}
                    />
                    <ProfileMenuItem
                        label="Account Settings"
                        icon={Cog6ToothIcon}
                        onPress={() => { /* Navigate to Account Settings */ }}
                    />
                    <ProfileMenuItem
                        label="Support Center"
                        icon={LifebuoyIcon}
                        onPress={() => { /* Navigate to Support */ }}
                    />
                </StyledView>

                {/* Logout Button */}
                <StyledView className="px-6 mt-8">
                     <StyledPressable onPress={handleLogout} className="flex-row items-center justify-center bg-neutral-900 p-4 rounded-lg active:bg-neutral-800">
                        <ArrowRightOnRectangleIcon color="#EF4444" size={24} />
                        <StyledText className="text-red-500 text-base ml-4 font-semibold">Log Out</StyledText>
                    </StyledPressable>
                </StyledView>
            </StyledScrollView>
        </StyledSafeAreaView>
    );
};

export default ProfileScreen;