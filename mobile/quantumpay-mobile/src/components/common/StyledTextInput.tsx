import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { styled } from 'nativewind';

const StyledInput = styled(TextInput);
const StyledView = styled(View);
const StyledText = styled(Text);

interface Props extends TextInputProps {
    label: string;
    error?: string;
}

const StyledTextInput = ({ label, error, ...props }: Props) => {
    const errorClasses = "border-red-500";
    const baseClasses = "bg-neutral-800 border border-neutral-700 text-white p-4 rounded-xl text-base";

    return (
        <StyledView>
            <StyledText className="text-neutral-300 text-sm font-medium mb-2">{label}</StyledText>
            <StyledInput
                className={`${baseClasses} ${error ? errorClasses : 'focus:border-primary'}`}
                placeholderTextColor="#64748B"
                {...props}
            />
            {error && <StyledText className="text-red-500 text-xs mt-1">{error}</StyledText>}
        </StyledView>
    );
};

export default StyledTextInput;