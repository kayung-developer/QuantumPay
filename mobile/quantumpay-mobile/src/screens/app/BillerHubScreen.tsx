import React from 'react';
import { View, Text, SafeAreaView, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BillerStackParamList } from '../../navigation/BillerNavigator';
import useApi from '../../hooks/useApi';
import { PhoneIcon, TvIcon, BoltIcon, WifiIcon, BanknotesIcon } from 'react-native-heroicons/outline';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

type Props = NativeStackScreenProps<BillerStackParamList, 'BillerHub'>;

// Mapping API category IDs/names to icons for a better UI
const categoryIcons = {
    airtime: PhoneIcon,
    tv: TvIcon,
    electricity: BoltIcon,
    internet: WifiIcon,
    government: BanknotesIcon,
};

const BillerHubScreen = ({ navigation }: Props) => {
    // Fetch all unified billers. We will derive the categories from this list.
    const { data: allBillers, loading, error, request: refetch } = useApi('/bills/all');

    // Use memoization to extract unique categories from the biller list
    const categories = React.useMemo(() => {
        if (!allBillers) return [];
        const categoryMap = new Map();
        allBillers.forEach(biller => {
            if (!categoryMap.has(biller.category)) {
                categoryMap.set(biller.category, {
                    id: biller.category,
                    name: biller.category.replace(/_/g, ' '),
                });
            }
        });
        return Array.from(categoryMap.values());
    }, [allBillers]);

    const renderItem = ({ item }: { item: { id: string; name: string } }) => {
        const Icon = categoryIcons[item.id] || BoltIcon;
        return (
            <StyledPressable
                onPress={() => navigation.navigate('BillerList', { categoryId: item.id, categoryName: item.name })}
                className="bg-neutral-900 p-4 rounded-xl items-center justify-center space-y-2 flex-grow m-2 active:bg-neutral-800"
                style={{ minWidth: '45%' }}
            >
                <Icon color="#6D28D9" size={32} />
                <StyledText className="text-white font-semibold capitalize">{item.name}</StyledText>
            </StyledPressable>
        );
    };

    return (
        <StyledSafeAreaView className="flex-1 bg-neutral-950">
            <StyledView className="p-6">
                <StyledText className="text-white text-3xl font-bold font-display">Pay Bills & Utilities</StyledText>
                <StyledText className="text-neutral-400 mt-1">Select a category to get started.</StyledText>
            </StyledView>

            {loading && <ActivityIndicator size="large" color="#4F46E5" />}

            {error && (
                <StyledView className="items-center justify-center p-6">
                    <StyledText className="text-red-400">Could not load biller options.</StyledText>
                    <StyledPressable onPress={refetch} className="mt-4"><StyledText className="text-primary-light">Tap to retry</StyledText></StyledPressable>
                </StyledView>
            )}

            {!loading && !error && (
                <FlatList
                    data={categories}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                />
            )}
        </StyledSafeAreaView>
    );
};

export default BillerHubScreen;