import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// We will create these screens shortly
import BillerHubScreen from '../screens/app/BillerHubScreen';
import BillerListScreen from '../screens/app/BillerListScreen';
import BillerPaymentScreen from '../screens/app/BillerPaymentScreen';

// Define the types and params for this navigation stack
export type BillerStackParamList = {
    BillerHub: undefined;
    BillerList: { categoryId: string; categoryName: string };
    BillerPayment: { biller: { id: string; name: string; requires_validation: boolean; provider: string; category: string; } };
};

const Stack = createNativeStackNavigator<BillerStackParamList>();

const BillerNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#020617' }, // neutral-950
            }}
        >
            <Stack.Screen name="BillerHub" component={BillerHubScreen} />
            <Stack.Screen name="BillerList" component={BillerListScreen} />
            <Stack.Screen name="BillerPayment" component={BillerPaymentScreen} />
        </Stack.Navigator>
    );
};

export default BillerNavigator;