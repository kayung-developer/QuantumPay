import React from 'react';
import { Modal, View, Text, Pressable, SafeAreaView, StyleSheet } from 'react-native';
import { styled } from 'nativewind';
import { MotiView } from 'moti';
import { XMarkIcon } from 'react-native-heroicons/solid';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledSafeAreaView = styled(SafeAreaView);

interface Props {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const NativeModal = ({ isOpen, onClose, title, children }: Props) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isOpen}
            onRequestClose={onClose} // For Android back button
        >
            {/* The outer container with a semi-transparent backdrop */}
            <StyledView className="flex-1 justify-center items-center bg-black/70">
                {/* KeyboardAvoidingView can be added here if the modal contains inputs */}

                {/* The animated content panel */}
                <MotiView
                    from={{ opacity: 0, scale: 0.8, translateY: 50 }}
                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 300 }}
                    style={StyleSheet.absoluteFill} // Use this to allow closing by tapping backdrop
                >
                    {/* The backdrop pressable for closing the modal */}
                    <StyledPressable className="flex-1" onPress={onClose} />
                </MotiView>

                <MotiView
                    from={{ opacity: 0, scale: 0.8, translateY: 50 }}
                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 300 }}
                    className="w-11/12 max-w-md bg-neutral-800 rounded-2xl border border-neutral-700 shadow-lg"
                >
                    {/* Modal Header */}
                    <StyledView className="flex-row justify-between items-center p-4 border-b border-neutral-700">
                        <StyledText className="text-white text-lg font-bold">
                            {title}
                        </StyledText>
                        <StyledPressable onPress={onClose} className="p-1">
                            <XMarkIcon color="#94A3B8" size={24} />
                        </StyledPressable>
                    </StyledView>

                    {/* Modal Content */}
                    <StyledView className="p-6">
                        {children}
                    </StyledView>
                </MotiView>
            </StyledView>
        </Modal>
    );
};

export default NativeModal;