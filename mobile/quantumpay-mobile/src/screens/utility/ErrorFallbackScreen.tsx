import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { styled } from 'nativewind';
import { ExclamationTriangleIcon } from 'react-native-heroicons/solid';
import StyledButton from '../../components/common/StyledButton';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);

interface Props {
    error: Error;
    resetError: () => void; // Function to reset the error state and retry rendering
}

const ErrorFallbackScreen = ({ error, resetError }: Props) => {
    return (
        <StyledSafeAreaView className="flex-1 bg-neutral-950">
            <StyledView className="flex-1 justify-center items-center p-8">
                <ExclamationTriangleIcon color="#EF4444" size={48} />
                <StyledText className="text-white text-2xl font-bold mt-4">Oops! Something Went Wrong</StyledText>
                <StyledText className="text-neutral-400 mt-2 text-center">
                    We've encountered an unexpected error. Please try restarting the app.
                </StyledText>

                <StyledView className="w-full mt-8">
                    <StyledButton label="Try Again" onPress={resetError} />
                </StyledView>

                {/* For development builds, show the actual error message */}
                {__DEV__ && (
                    <StyledScrollView className="w-full h-40 bg-neutral-900 p-2 rounded-lg mt-4 border border-neutral-700">
                        <StyledText className="text-red-400 font-mono text-xs">
                            {error.toString()}
                        </StyledText>
                    </StyledScrollView>
                )}
            </StyledView>
        </StyledSafeAreaView>
    );
};

export default ErrorFallbackScreen;