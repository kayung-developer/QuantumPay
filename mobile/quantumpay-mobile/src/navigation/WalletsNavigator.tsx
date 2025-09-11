import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// We will create these screens shortly
import WalletsScreen from '../screens/app/WalletsScreen';
import WalletDetailScreen from '../screens/app/WalletDetailScreen';

// Define the types for this specific navigation stack
export type WalletsStackParamList = {
    WalletsList: undefined; // The main screen showing all wallets
    WalletDetail: { walletId: string; currencyCode: string }; // Pass necessary info to the detail screen
};

const Stack = createNativeStackNavigator<WalletsStackParamList>();

const WalletsNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#020617' }, // neutral-950
            }}
        >
            <Stack.Screen name="WalletsList" component={WalletsScreen} />
            <Stack.Screen name="WalletDetail" component={WalletDetailScreen} />
        </Stack.Navigator>
    );
};

export default WalletsNavigator;