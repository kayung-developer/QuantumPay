import React, { useState } from 'react';
import { View, Text, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { styled } from 'nativewind';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MerchantStackParamList } from '../../navigation/MerchantNavigator';
import { useAppStore } from '../../store/authStore';
import QRCode from 'react-native-qrcode-svg';
import { ArrowLeftIcon, BackspaceIcon, ShoppingCartIcon } from 'react-native-heroicons/solid';
import useApi from '../../hooks/useApi';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledScrollView = styled(ScrollView);

type Props = NativeStackScreenProps<MerchantStackParamList, 'POS'>;

const POSScreen = ({ route, navigation }: Props) => {
    const { dbUser } = useAppStore();
    const { data: products } = useApi('/business/products');
    const [cart, setCart] = useState([]);
    const [view, setView] = useState('keypad'); // 'keypad' or 'products' or 'qr'

    const currency = route.params?.currency || 'NGN';

    const totalAmount = useMemo(() => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [cart]);
    const formattedAmount = new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(totalAmount);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        setView('keypad'); // Switch back to keypad view after adding a product
    };

    const qrData = JSON.stringify({
        type: "merchant_cart_payment",
        business_id: dbUser?.business_profile?.id,
        name: dbUser?.business_profile?.business_name,
        amount: totalAmount,
        currency: currency,
        items: cart.map(item => ({ id: item.id, name: item.name, quantity: item.quantity })),
    });

    return (
        <StyledSafeAreaView className="flex-1 bg-neutral-950">
            <StyledView className="flex-row items-center p-4 justify-between">
                <StyledPressable onPress={() => navigation.goBack()} className="p-2"><ArrowLeftIcon color="white" size={24} /></StyledPressable>
                <StyledText className="text-white text-xl font-bold">Point of Sale</StyledText>
                <StyledPressable onPress={() => setView(view === 'products' ? 'keypad' : 'products')} className="p-2">
                    <ShoppingCartIcon color="white" size={24} />
                </StyledPressable>
            </StyledView>

            <StyledView className="flex-1 items-center justify-center">
                {view === 'qr' ? (
                    <StyledView className="items-center space-y-4 p-6">
                        <StyledText className="text-neutral-400">Scan to pay</StyledText>
                        <StyledText className="text-white font-bold text-4xl">{formattedAmount}</StyledText>
                        <StyledView className="bg-white p-6 rounded-2xl"><QRCode value={qrData} size={250} /></StyledView>
                        <StyledPressable onPress={() => { setView('keypad'); setCart([]); }} className="mt-4">
                            <StyledText className="text-primary-light text-lg">New Sale</StyledText>
                        </StyledPressable>
                    </StyledView>
                ) : (
                    <StyledView className="items-center">
                        <StyledText className="text-white font-bold text-6xl">{formattedAmount}</StyledText>
                        <StyledText className="text-neutral-500">{cart.length > 0 ? `${cart.length} item(s) in cart` : 'Add products or enter custom amount'}</StyledText>
                    </StyledView>
                )}
            </StyledView>

            {/* Main Content Area */}
            {view === 'products' ? (
                 <StyledScrollView className="w-full flex-grow">
                    {products?.map(p => (
                        <StyledPressable key={p.id} onPress={() => addToCart(p)} className="p-4 border-b border-neutral-800 flex-row justify-between">
                            <StyledText className="text-white">{p.name}</StyledText>
                            <StyledText className="text-white">{p.price} {p.currency}</StyledText>
                        </StyledPressable>
                    ))}
                 </StyledScrollView>
            ) : view === 'keypad' ? (
                <StyledView className="w-full p-4">
                    <StyledPressable onPress={() => setView('qr')} disabled={totalAmount <= 0} className="w-full h-20 items-center justify-center bg-primary rounded-xl active:bg-primary-dark disabled:bg-neutral-700">
                        <StyledText className="text-white font-bold text-xl">Generate Code</StyledText>
                    </StyledPressable>
                </StyledView>
            ) : null}
        </StyledSafeAreaView>
    );
};

export default POSScreen;