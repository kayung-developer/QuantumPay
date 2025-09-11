import { TourStep } from "react-native-spotlight-tour";

// This file defines the steps for all guided tours in the mobile application.

export const homeScreenTourSteps: TourStep[] = [
    {
        // This step doesn't attach to anything, it's a general welcome message.
        render: ({ next }) => (
            <View className="p-6 bg-neutral-800 rounded-lg">
                <Text className="text-white font-bold text-xl mb-2">Welcome to QuantumPay!</Text>
                <Text className="text-neutral-300 mb-4">Let's take a quick tour of your new financial dashboard.</Text>
                <Button title="Start Tour" onPress={next} />
            </View>
        ),
    },
    {
        name: 'wallets-carousel', // A unique name for this step
        title: 'Your Wallets',
        message: 'This is where you can see your balances in different currencies. Swipe left and right to see all your wallets.',
        nextButtonText: 'Got it!',
    },
    {
        name: 'quick-actions',
        title: 'Quick Actions',
        message: 'Use these buttons for your most common tasks, like sending money or scanning a QR code to pay.',
    },
    {
        name: 'recent-activity',
        title: 'Recent Activity',
        message: 'Your latest transactions will appear here, giving you a quick overview of your money flow.',
    },
    {
        name: 'scan-pay-tab',
        title: 'Scan & Pay',
        message: 'This is your main gateway for all payment actions. Tap here to send, request, or scan to pay.',
        before: () => new Promise(resolve => setTimeout(resolve, 300)), // Small delay for UI to settle
    },
    {
        render: ({ finish }) => (
             <View className="p-6 bg-neutral-800 rounded-lg">
                <Text className="text-white font-bold text-xl mb-2">You're All Set!</Text>
                <Text className="text-neutral-300 mb-4">You've learned the basics. Feel free to explore and manage your finances.</Text>
                <Button title="Finish" onPress={finish} />
            </View>
        ),
    }
];

// We need to import some components for the custom render steps
import React from 'react';
import { View, Text, Button } from 'react-native';