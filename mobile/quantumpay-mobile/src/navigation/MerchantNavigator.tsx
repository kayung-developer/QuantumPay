import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MerchantDashboardScreen from '../screens/merchant/MerchantDashboardScreen';
import POSScreen from '../screens/merchant/POSScreen';
import ProductCatalogScreen from '../screens/merchant/ProductCatalogScreen';

export type MerchantStackParamList = {
    MerchantDashboard: undefined;
    POS: undefined;
    ProductCatalog: undefined;
};

const Stack = createNativeStackNavigator<MerchantStackParamList>();

const MerchantNavigator = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MerchantDashboard" component={MerchantDashboardScreen} />
        <Stack.Screen name="POS" component={POSScreen} />
        <Stack.Screen name="ProductCatalog" component={ProductCatalogScreen} />
    </Stack.Navigator>
);

export default MerchantNavigator;