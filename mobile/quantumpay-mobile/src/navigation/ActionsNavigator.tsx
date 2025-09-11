import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ActionsHubScreen from '../screens/app/ActionsHubScreen';
// We will create the Scan and MyCode screens next
import ScanScreen from '../screens/app/ScanScreen';
import MyCodeScreen from '../screens/app/MyCodeScreen';
import SendMoneyScreen from '../screens/app/SendMoneyScreen';
import RequestMoneyScreen from '../screens/app/RequestMoneyScreen';
import PaymentConfirmationScreen from '../screens/app/PaymentConfirmationScreen';

export type ActionsStackParamList = {
    ActionsHub: undefined;
    Scan: undefined;
    MyCode: undefined;
    SendMoney: undefined; // New
    RequestMoney: undefined; // New
    // New: Pass recipient data to the confirmation screen
    PaymentConfirmation: { recipient: { user_id: string; name: string; email: string; } };
};

const Stack = createNativeStackNavigator<ActionsStackParamList>();

const ActionsNavigator = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ActionsHub" component={ActionsHubScreen} />
        <Stack.Screen name="Scan" component={ScanScreen} />
        <Stack.Screen name="MyCode" component={MyCodeScreen} />
        <Stack.Screen name="SendMoney" component={SendMoneyScreen} />
        <Stack.Screen name="RequestMoney" component={RequestMoneyScreen} />
        <Stack.Screen name="PaymentConfirmation" component={PaymentConfirmationScreen} />
    </Stack.Navigator>
);

export default ActionsNavigator;