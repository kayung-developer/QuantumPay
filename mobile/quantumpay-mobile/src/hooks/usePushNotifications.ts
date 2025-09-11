import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useAppStore } from '../store/authStore';
import { useApiPost } from './useApi';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const usePushNotifications = () => {
    const { post: registerDevice } = useApiPost('/users/register-device');
    const authToken = useAppStore(state => state.authToken);

    useEffect(() => {
        // This effect runs when the user logs in (authToken becomes available)
        if (authToken) {
            registerForPushNotificationsAsync();
        }
    }, [authToken]);

    async function registerForPushNotificationsAsync() {
        if (!Device.isDevice) {
            console.log("Push notifications only work on physical devices.");
            return;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }

        try {
            const token = (await Notifications.getExpoPushTokenAsync({
                projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
            })).data;

            // Register the token with our backend
            await registerDevice({
                expo_push_token: token,
                device_name: Device.deviceName,
            });

        } catch (e) {
            console.error("Error getting push token:", e);
        }
    }
};