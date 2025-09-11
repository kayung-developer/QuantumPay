import React, { useState } from 'react';
import { View, Text, SafeAreaView, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAppStore } from '../../store/authStore';
import StyledButton from '../../components/common/StyledButton';
import StyledTextInput from '../../components/common/StyledTextInput';
import { Picker } from '@react-native-picker/picker';
import { styled } from 'nativewind';

const StyledPressable = styled(Pressable);

// List of supported countries for registration
const countryOptions = [
    { value: 'NG', label: 'Nigeria (+234)' },
    { value: 'KE', label: 'Kenya (+254)' },
    { value: 'GH', label: 'Ghana (+233)' },
    { value: 'ZA', label: 'South Africa (+27)' },
    { value: 'US', label: 'United States (+1)' },
];

// Robust validation schema for the registration form
const RegisterSchema = Yup.object().shape({
  full_name: Yup.string().min(2, 'Name is too short').max(50, 'Name is too long').required('Full name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  country_code: Yup.string().required('Please select your country'),
  phone_number: Yup.string().matches(/^[0-9]{7,15}$/, 'Enter a valid phone number without country code').required('Phone number is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: Props) => {
    const [isLoading, setIsLoading] = useState(false);
    const registerUserInBackend = useAppStore(state => state.register);

    const formik = useFormik({
        initialValues: { full_name: '', email: '', country_code: 'NG', phone_number: '', password: '' },
        validationSchema: RegisterSchema,
        onSubmit: async (values) => {
            setIsLoading(true);
            try {
                // Step 1: Create the user in Firebase Authentication
                const userCredential = await createUserWithEmailAndPassword(auth, values.email.trim(), values.password);
                const user = userCredential.user;

                // Step 2: Update the new Firebase user's profile with their display name
                await updateProfile(user, { displayName: values.full_name });

                // Step 3: Call our Zustand store's register function. This function will
                // get the Firebase token and call our backend's /complete-registration endpoint.
                await registerUserInBackend(
                    values.email,
                    values.password, // Passed for potential re-auth, not strictly needed here
                    values.full_name,
                    values.country_code,
                    values.phone_number
                );
                // On success, the onAuthStateChanged listener will handle navigation to the main app.
            } catch (error: any) {
                let errorMessage = "An unknown error occurred during registration.";
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = 'This email address is already registered. Please try logging in.';
                } else {
                    errorMessage = error.message;
                }
                Alert.alert('Registration Failed', errorMessage);
            } finally {
                setIsLoading(false);
            }
        },
    });

    return (
        <SafeAreaView className="flex-1 bg-neutral-950">
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <ScrollView contentContainerStyle={{ padding: 24, justifyContent: 'center', flexGrow: 1 }}>
                    <View className="items-center mb-8">
                        <Text className="text-white text-4xl font-bold font-display">Get Started</Text>
                        <Text className="text-neutral-400 mt-2 text-center">Create an account to start managing your finances globally.</Text>
                    </View>

                    <StyledTextInput label="Full Name" value={formik.values.full_name} onChangeText={formik.handleChange('full_name')} onBlur={formik.handleBlur('full_name')} error={formik.touched.full_name ? formik.errors.full_name : undefined} autoComplete="name" />
                    <View className="mt-4"/>
                    <StyledTextInput label="Email Address" value={formik.values.email} onChangeText={formik.handleChange('email')} onBlur={formik.handleBlur('email')} error={formik.touched.email ? formik.errors.email : undefined} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />

                    <View className="mt-4">
                        <Text className="text-neutral-300 text-sm font-medium mb-2">Country</Text>
                        <View className="bg-neutral-800 border border-neutral-700 rounded-xl">
                            <Picker
                                selectedValue={formik.values.country_code}
                                onValueChange={(itemValue) => formik.setFieldValue('country_code', itemValue)}
                                style={{ color: 'white' }}
                                dropdownIconColor="white"
                                prompt="Select your country"
                            >
                                {countryOptions.map(opt => <Picker.Item key={opt.value} label={opt.label} value={opt.value} />)}
                            </Picker>
                        </View>
                    </View>

                    <View className="mt-4"/>
                    <StyledTextInput label="Phone Number" value={formik.values.phone_number} onChangeText={formik.handleChange('phone_number')} onBlur={formik.handleBlur('phone_number')} error={formik.touched.phone_number ? formik.errors.phone_number : undefined} keyboardType="phone-pad" autoComplete="tel" />
                    <View className="mt-4"/>
                    <StyledTextInput label="Password (8+ characters)" value={formik.values.password} onChangeText={formik.handleChange('password')} onBlur={formik.handleBlur('password')} error={formik.touched.password ? formik.errors.password : undefined} secureTextEntry autoComplete="new-password" />

                    <View className="mt-8"/>
                    <StyledButton label="Create Account" onPress={() => formik.handleSubmit()} isLoading={isLoading} />

                    <StyledPressable onPress={() => navigation.navigate('Login')} className="mt-6 items-center">
                        <Text className="text-primary-light font-semibold">Already have an account? Sign In</Text>
                    </StyledPressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default RegisterScreen;