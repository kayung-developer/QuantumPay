import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import { auth } from '../lib/firebase'; // <-- REAL FIREBASE AUTH
import { onAuthStateChanged, User } from 'firebase/auth';
import { usePushNotifications } from '../hooks/usePushNotifications';

const RootNavigator = () => {
    const { status, login, logout, setAuthStatus } = useAuthStore();
    usePushNotifications();

    useEffect(() => {
        // This is the REAL Firebase auth state listener
        const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
            if (user) {
                try {
                    // User is signed in with Firebase, now sync with our backend
                    const token = await user.getIdToken();
                    await login(token);
                } catch (error) {
                    console.error("Failed to get token or login to backend, signing out.", error);
                    // If backend login fails, force a logout to prevent a broken state
                    await auth.signOut();
                    logout();
                }
            } else {
                // User is signed out
                logout();
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    if (status === 'loading' || status === 'idle') {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' }}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {status === 'authenticated' ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
};

export default RootNavigator;