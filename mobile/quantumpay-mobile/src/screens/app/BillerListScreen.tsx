import React, { useMemo } from 'react';
import { View, Text, SafeAreaView, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BillerStackParamList } from '../../navigation/BillerNavigator';
import useApi from '../../hooks/useApi';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

type Props = NativeStackScreenProps<BillerStackParamList, 'BillerList'>;

const BillerListScreen = ({ route, navigation }: Props) => {
    const { categoryId, categoryName } = route.params;
    const { data: allBillers, loading, error } = useApi('/bills/all');

    const billersInCategory = useMemo(() => {
        if (!allBillers) return [];
        return allBillers.filter(b => b.category === categoryId);
    }, [allBillers, categoryId]);

    const renderItem = ({ item }) => (
        <StyledPressable
            onPress={() => navigation.navigate('BillerPayment', { biller: item })}
            className="bg-neutral-900 p-4 rounded-xl mb-3 active:bg-neutral-800"
        >
            <StyledText className="text-white font-semibold text-base">{item.name}</StyledText>
            <StyledText className="text-neutral-500 text-xs mt-1">Provider: {item.provider}</StyledText>
        </StyledPressable>
    );

    return (
        <StyledSafeAreaView className="flex-1 bg-neutral-950">
            <StyledView className="flex-row items-center p-4">
                <StyledPressable onPress={() => navigation.goBack()} className="p-2"><ArrowLeftIcon color="white" size={24} /></StyledPressable>
                <StyledText className="text-white text-xl font-bold ml-4 capitalize">{categoryName}</StyledText>
            </StyledView>

            {loading && <ActivityIndicator size="large" color="#4F46E5" />}

            {error && (
                 <StyledView className="p-6 items-center"><StyledText className="text-red-400">Could not load billers.</StyledText></StyledView>
            )}

            {!loading && !error && (
                <FlatList
                    data={billersInCategory}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingHorizontal: 24 }}
                    ListEmptyComponent={<StyledView className="p-6 items-center"><StyledText className="text-neutral-500">No billers found in this category.</StyledText></StyledView>}
                />
            )}
        </StyledSafeAreaView>
    );
};

export default BillerListScreen;