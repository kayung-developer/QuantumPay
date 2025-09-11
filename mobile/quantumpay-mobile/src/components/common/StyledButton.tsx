import React from 'react';
import { Pressable, Text, ActivityIndicator, ViewStyle } from 'react-native';
import { styled } from 'nativewind';
import { haptics } from '../../lib/haptics';

const StyledPressable = styled(Pressable);
const StyledText = styled(Text);

interface Props {
    onPress: () => void;
    label: string;
    variant?: 'primary' | 'secondary' | 'outline';
    isLoading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
}

const StyledButton = ({ onPress, label, variant = 'primary', isLoading = false, disabled = false, style }: Props) => {
    const baseClasses = "py-4 px-6 rounded-xl flex-row justify-center items-center";
    const disabledClasses = "opacity-50";

    const variantClasses = {
        primary: "bg-primary",
        secondary: "bg-neutral-800",
        outline: "bg-transparent border-2 border-primary",
    };

    const textVariantClasses = {
        primary: "text-white",
        secondary: "text-white",
        outline: "text-primary",
    };
      const handlePress = () => {
        // [THE IMPLEMENTATION]
        // Trigger a light haptic tap on every button press.
        haptics.light();
        onPress();
    };

    return (
        <StyledPressable
            onPress={handlePress}
            disabled={disabled || isLoading}
            style={style}
            className={`${baseClasses} ${variantClasses[variant]} ${disabled || isLoading ? disabledClasses : ''}`}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === 'outline' ? '#4F46E5' : 'white'} />
            ) : (
                <StyledText className={`text-base font-bold text-center ${textVariantClasses[variant]}`}>
                    {label}
                </StyledText>
            )}
        </StyledPressable>
    );
};

export default StyledButton;