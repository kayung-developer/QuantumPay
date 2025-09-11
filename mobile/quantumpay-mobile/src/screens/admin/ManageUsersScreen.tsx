import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, FlatList, Pressable, TextInput } from 'react-native';
import { styled } from 'nativewind';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';
import useApi from '../../hooks/useApi';
import Spinner from '../../components/common/Spinner';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledTextInput = styled(TextInput);

type Props = NativeStackScreenProps<AdminStackParamList, 'ManageUsers'>;

const UserItem = ({ item }) => (
    <StyledView className="bg-neutral-900 p-4 rounded-xl mb-3">
        <StyledView className="flex-row justify-between">
            <StyledText className="text-white font-semibold">{item.full_name}</StyledText>
            <StyledText className="text-white font-mono text-xs bg-neutral-700 px-2 py-1 rounded-full">{item.country_code}</StyledText>
        </StyledView>
        <StyledText className="text-neutral-400 text-sm">{item.email}</StyledText>
        <StyledText className={`text-xs capitalize mt-2 ${item.role === 'admin' || item.role === 'superuser' ? 'text-yellow-400' : 'text-neutral-500'}`}>{item.role}</StyledText>
    </StyledView>
);

const ManageUsersScreen = ({ navigation }: Props) => {
    const { data: users, loading, error, request: fetchUsers } = useApi('/admin/users', {}, true); // Manual fetch
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users?.filter(user =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
         <StyledSafeAreaView className="flex-1 bg-neutral-950">
            <StyledView className="flex-row items-center p-4">
                <StyledPressable onPress={() => navigation.goBack()} className="p-2"><ArrowLeftIcon color="white" size={24} /></StyledPressable>
                <StyledText className="text-white text-xl font-bold ml-4">Manage Users</StyledText>
            </StyledView>

            <StyledView className="px-6 pb-4">
                <StyledTextInput
                    placeholder="Search by name or email..."
                    placeholderTextColor="#64748B"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="bg-neutral-800 rounded-xl p-4 text-white"
                />
            </StyledView>

            {loading && <Spinner />}

            <FlatList
                data={filteredUsers || []}
                renderItem={({ item }) => <UserItem item={item} />}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 24 }}
                 ListEmptyComponent={
                    <StyledView className="items-center py-20">
                        <StyledText className="text-neutral-500">No users found.</StyledText>
                    </StyledView>
                 }
            />
        </StyledSafeAreaView>
    );
};

export default ManageUsersScreen;