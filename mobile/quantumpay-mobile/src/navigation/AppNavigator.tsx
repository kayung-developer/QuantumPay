import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
    HomeIcon,
    WalletIcon,
    UserCircleIcon,
    QrCodeIcon,
    ReceiptPercentIcon,
    BuildingStorefrontIcon,
    ShieldCheckIcon
} from 'react-native-heroicons/solid';
import { useAppStore } from '../store/authStore';
import { Platform, View } from 'react-native';
import { useSpotlight } from 'react-native-spotlight-tour';
import { styled } from 'nativewind';

// Navigators
import HomeScreen from '../screens/app/HomeScreen';
import WalletsNavigator from './WalletsNavigator';
import ProfileNavigator from './ProfileNavigator';
import ActionsNavigator from './ActionsNavigator';
import BillerNavigator from './BillerNavigator';
import AdminNavigator from './AdminNavigator';
import MerchantNavigator from './MerchantNavigator';

const StyledView = styled(View);

export type AppTabParamList = {
    Home: undefined;
    Wallets: undefined;
    Actions: undefined;
    Bills: undefined;
    Profile: undefined;
    Merchant: undefined;
    Admin: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

// --- [THE FIX] Create a dedicated component for the Spotlight-enabled tab icon ---
// This component is rendered inside the SpotlightTourProvider, so it can safely use the hook.
const ActionsTabIcon = ({ color, size }: { color: string; size: number }) => {
    const { Spotlight } = useSpotlight('scan-pay-tab');

    return (
        <Spotlight>
            <QrCodeIcon color={color} size={size} />
        </Spotlight>
    );
};


const AppNavigator = () => {
    const { dbUser } = useAppStore();

    // In a production app, the business_profile might be nested.
    // Ensure the structure matches what your /users/me endpoint returns.
    const isMerchant = !!dbUser?.business_profile;
    const isAdmin = dbUser?.role === 'admin' || dbUser?.role === 'superuser';

    return (
        <Tab.Navigator
            // Move screenOptions into a constant for better readability
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: true,
                tabBarStyle: {
                    backgroundColor: '#0F172A', // neutral-900
                    borderTopColor: '#1E293B', // neutral-800
                    height: Platform.OS === 'ios' ? 90 : 70,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                },
                tabBarLabelStyle: {
                    fontWeight: '600',
                    fontSize: 10, // A smaller font size for better fit
                },
                tabBarActiveTintColor: '#6D28D9', // primary-light
                tabBarInactiveTintColor: '#64748B', // neutral-500
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Wallets"
                component={WalletsNavigator}
                options={{
                    tabBarIcon: ({ color, size }) => <WalletIcon color={color} size={size} />,
                }}
            />

            {/* Conditionally render the Merchant tab */}
            {isMerchant && (
                <Tab.Screen
                    name="Merchant"
                    component={MerchantNavigator}
                    options={{
                        tabBarIcon: ({ color, size }) => <BuildingStorefrontIcon color={color} size={size} />,
                    }}
                />
            )}

            <Tab.Screen
                name="Actions"
                component={ActionsNavigator}
                options={{
                    tabBarLabel: "Scan & Pay",
                    // Use the new dedicated component for the icon
                    tabBarIcon: ({ color, size }) => <ActionsTabIcon color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Bills"
                component={BillerNavigator}
                options={{
                    tabBarLabel: "Pay Bills",
                    tabBarIcon: ({ color, size }) => <ReceiptPercentIcon color={color} size={size} />,
                }}
            />

             {/* Conditionally render the Admin tab */}
            {isAdmin && (
                <Tab.Screen
                    name="Admin"
                    component={AdminNavigator}
                    options={{
                        tabBarIcon: ({ color, size }) => <ShieldCheckIcon color={color} size={size} />,
                    }}
                />
            )}

            <Tab.Screen
                name="Profile"
                component={ProfileNavigator}
                options={{
                    tabBarIcon: ({ color, size }) => <UserCircleIcon color={color} size={size} />,
                }}
            />
        </Tab.Navigator>
    );
};

export default AppNavigator;