import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProfileScreen from '../screens/app/ProfileScreen';
import SecurityScreen from '../screens/app/SecurityScreen';
import TwoFactorSetupScreen from '../screens/app/TwoFactorSetupScreen'; // <-- NEW IMPORT

export type ProfileStackParamList = {
    ProfileHome: undefined;
    Security: undefined;
    TwoFactorSetup: undefined; // <-- NEW SCREEN
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#020617' },
            }}
        >
            <Stack.Screen name="ProfileHome" component={ProfileScreen} />
            <Stack.Screen name="Security" component={SecurityScreen} />

            {/* Configure the 2FA screen to appear as a modal */}
            <Stack.Screen
                name="TwoFactorSetup"
                component={TwoFactorSetupScreen}
                options={{ presentation: 'modal' }}
            />
        </Stack.Navigator>
    );
};

export default ProfileNavigator;