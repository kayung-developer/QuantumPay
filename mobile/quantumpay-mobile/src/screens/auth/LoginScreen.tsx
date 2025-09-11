import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import StyledButton from '../../components/common/StyledButton';
import StyledTextInput from '../../components/common/StyledTextInput';
import { styled } from 'nativewind';
import * as LocalAuthentication from 'expo-local-authentication';
import { FingerPrintIcon } from 'react-native-heroicons/solid';

const StyledPressable = styled(Pressable);

// Validation schema for the login form
const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email format').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

// Define the screen's navigation props
type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
    // State for the loading indicator on the button
    const [isLoading, setIsLoading] = useState(false);
    // State to determine if biometric hardware is available and enrolled
    const [hasBiometrics, setHasBiometrics] = useState(false);

    // Check for biometric capabilities when the component mounts
    useEffect(() => {
        (async () => {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            setHasBiometrics(compatible && enrolled);
        })();
    }, []);

    const handleBiometricAuth = async () => {
        const { success } = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Log in to QuantumPay',
            cancelLabel: 'Use Password',
            disableDeviceFallback: true, // Prevents falling back to device passcode
        });

        if (success) {
            // In a production app with credential saving (e.g., in Expo's SecureStore),
            // you would retrieve the user's email/password here and proceed with the login.
            // This provides a truly seamless biometric login experience.
            Alert.alert("Biometric Success (Demo)", "In a real app, this would log you in using securely stored credentials.");
        }
    };

    // Initialize Formik for form state management and validation
    const formik = useFormik({
        initialValues: { email: '', password: '' },
        validationSchema: LoginSchema,
        onSubmit: async (values) => {
            setIsLoading(true);
            try {
                // Attempt to sign in with Firebase.
                // On success, our global `onAuthStateChanged` listener in RootNavigator
                // will automatically handle fetching the backend profile and navigating to the app.
                await signInWithEmailAndPassword(auth, values.email.trim(), values.password);
            } catch (error: any) {
                let errorMessage = "An unknown error occurred. Please try again.";
                // Provide user-friendly error messages for common Firebase auth errors.
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    errorMessage = 'Invalid email or password. Please check your credentials and try again.';
                } else if (error.code === 'auth/too-many-requests') {
                    errorMessage = 'Access to this account has been temporarily disabled due to many failed login attempts. You can reset your password or try again later.';
                } else {
                    errorMessage = error.message;
                }
                Alert.alert('Login Failed', errorMessage);
            } finally {
                setIsLoading(false);
            }
        },
    });

    return (
        <SafeAreaView className="flex-1 bg-neutral-950">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                    <View className="p-6">
                        <View className="items-center mb-10">
                            <Text className="text-white text-4xl font-bold font-display">QuantumPay</Text>
                            <Text className="text-neutral-400 mt-2">Welcome back. Sign in to continue.</Text>
                        </View>

                        <StyledTextInput
                            label="Email Address"
                            placeholder="you@example.com"
                            value={formik.values.email}
                            onChangeText={formik.handleChange('email')}
                            onBlur={formik.handleBlur('email')}
                            error={formik.touched.email ? formik.errors.email : undefined}
                            keyboardType="email-address"
                            autoComplete="email"
                            autoCapitalize="none"
                        />

                        <View className="mt-4"/>

                        <StyledTextInput
                            label="Password"
                            placeholder="••••••••"
                            value={formik.values.password}
                            onChangeText={formik.handleChange('password')}
                            onBlur={formik.handleBlur('password')}
                            error={formik.touched.password ? formik.errors.password : undefined}
                            secureTextEntry
                            autoComplete="password"
                        />

                        <View className="flex-row justify-between items-center mt-6">
                            <StyledPressable onPress={() => navigation.navigate('Register')}>
                                <Text className="text-primary-light font-semibold">Create Account</Text>
                            </StyledPressable>
                            {hasBiometrics && (
                                <StyledPressable onPress={handleBiometricAuth} className="p-2">
                                    <FingerPrintIcon size={32} color="#4F46E5" />
                                </StyledPressable>
                            )}
                        </View>

                        <View className="mt-8"/>

                        <StyledButton
                            label="Sign In"
                            onPress={() => formik.handleSubmit()}
                            isLoading={isLoading}
                        />
                         <StyledPressable onPress={() => { /* Navigate to Forgot Password */ }} className="mt-6 items-center">
                            <Text className="text-neutral-400">Forgot Password?</Text>
                        </StyledPressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;