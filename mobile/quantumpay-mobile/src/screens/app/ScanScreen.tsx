import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActionsStackParamList } from '../../navigation/ActionsNavigator';
import { styled } from 'nativewind';
import { ArrowLeftIcon } from 'react-native-heroicons/solid';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

type Props = NativeStackScreenProps<ActionsStackParamList, 'Scan'>;

const ScanScreen = ({ navigation }: Props) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        getCameraPermissions();
    }, []);

    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        try {
            const parsedData = JSON.parse(data);

            // Validate the QR code payload
            if (parsedData.type === 'user_payment' && parsedData.user_id && parsedData.name) {
                // In a real flow, you would navigate to a payment confirmation screen:
                navigation.navigate('PaymentConfirmation', { recipient: parsedData });
                Alert.alert(
                    "QR Code Scanned!",
                    `You are about to pay ${parsedData.name} (${parsedData.email}).`,
                    [
                        { text: "Cancel", onPress: () => setScanned(false), style: "cancel" },
                        { text: "Proceed", onPress: () => setScanned(false) } // Placeholder
                    ]
                );
            } else {
                Alert.alert("Invalid QR Code", "This is not a valid QuantumPay QR code.", [{ text: "OK", onPress: () => setScanned(false) }]);
            }
        } catch (error) {
            Alert.alert("Invalid QR Code", "Could not read this QR code.", [{ text: "OK", onPress: () => setScanned(false) }]);
        }
    };

    if (hasPermission === null) {
        return <StyledView className="flex-1 bg-neutral-950 justify-center items-center"><StyledText className="text-white">Requesting for camera permission...</StyledText></StyledView>;
    }
    if (hasPermission === false) {
        return <StyledView className="flex-1 bg-neutral-950 justify-center items-center"><StyledText className="text-white">No access to camera. Please enable it in your settings.</StyledText></StyledView>;
    }

    return (
        <StyledView className="flex-1">
            <CameraView
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Overlay UI */}
            <StyledView style={StyleSheet.absoluteFillObject} className="bg-black/50 justify-between">
                <StyledPressable onPress={() => navigation.goBack()} className="absolute top-16 left-6 p-2">
                    <ArrowLeftIcon color="white" size={24} />
                </StyledPressable>

                <StyledView className="items-center justify-center">
                    <StyledView className="w-64 h-64 border-4 border-white/80 rounded-2xl" />
                    <StyledText className="text-white text-lg mt-4 font-semibold">Scan to Pay</StyledText>
                </StyledView>

                <StyledView />
            </StyledView>
        </StyledView>
    );
};

export default ScanScreen;