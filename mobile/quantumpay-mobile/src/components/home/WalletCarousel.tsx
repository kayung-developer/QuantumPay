import React from 'react';
import { View, Text, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';
import { useSpotlight } from 'react-native-spotlight-tour';

const StyledView = styled(View);
const StyledText = styled(Text);
const GradientView = styled(LinearGradient);

interface Wallet {
    id: string;
    currency_code: string;
    balance: number;
}

interface Props {
    wallets: Wallet[];
    isLoading: boolean;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;
const SPACING = 16;

const WalletCarousel = ({ wallets, isLoading }: Props) => {
    const { Spotlight } = useSpotlight('wallets-carousel');
    if (isLoading) {
        return (
            <StyledView className="h-40 justify-center items-center">
                <ActivityIndicator color="#fff" />
            </StyledView>
        );
    }

    const renderItem = ({ item }: { item: Wallet }) => (
        <GradientView
            colors={['#4F46E5', '#3730A3']}
            style={{ width: CARD_WIDTH, marginHorizontal: SPACING / 2 }}
            className="h-40 rounded-2xl p-5 justify-between"
        >
            <StyledView>
                <StyledText className="text-white font-semibold text-lg">{item.currency_code} Wallet</StyledText>
                <StyledText className="text-white/70 text-sm">Available Balance</StyledText>
            </StyledView>
            <StyledText className="text-white text-3xl font-bold">
                {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: item.currency_code,
                }).format(item.balance)}
            </StyledText>
        </GradientView>
    );

    return (
        <Spotlight> {/* <-- Wrap the component */}
            <FlatList
            data={wallets}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + SPACING}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: (width - CARD_WIDTH) / 2 - SPACING / 2 }}
            />
        </Spotlight>

    );
};

export default WalletCarousel;