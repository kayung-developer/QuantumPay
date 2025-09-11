import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ManageUsersScreen from '../screens/admin/ManageUsersScreen';
import KYCApprovalScreen from '../screens/admin/KYCApprovalScreen';

export type AdminStackParamList = {
    AdminDashboard: undefined;
    ManageUsers: undefined;
    KYCApprovals: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

const AdminNavigator = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
        <Stack.Screen name="KYCApprovals" component={KYCApprovalScreen} />
    </Stack.Navigator>
);

export default AdminNavigator;