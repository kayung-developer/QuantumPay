import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ArrowUpIcon, ArrowDownIcon, QrCodeIcon } from 'react-native-heroicons/outline';
import { styled } from 'nativewind';
import { useSpotlight } from 'react-native-spotlight-tour';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

const QuickActions = () => {
    const { Spotlight } = useSpotlight('quick-actions');
    const actions = [
        { label: 'Send', icon: ArrowUpIcon, onPress: () => {} },
        { label: 'Request', icon: ArrowDownIcon, onPress: () => {} },
        { label: 'Scan', icon: QrCodeIcon, onPress: () => {} },
    ];

    return (
    <Spotlight>
        <StyledView className="flex-row justify-around bg-neutral-900 p-4 rounded-2xl mx-6">
            {actions.map((action) => (
                <StyledPressable key={action.label} onPress={action.onPress} className="items-center space-y-2">
                    <StyledView className="w-14 h-14 bg-primary/20 rounded-full items-center justify-center">
                        <action.icon color="#6D28D9" size={28} />
                    </StyledView>
                    <StyledText className="text-white font-semibold text-sm">{action.label}</StyledText>
                </StyledPressable>
            ))}
        </StyledView>
      </Spotlight>
    );
};

export default QuickActions;