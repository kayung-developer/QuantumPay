import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, setAuthHeader, clearAuthHeader } from '../api/apiClient';

// This is a simplified user type for the frontend state.
// In a real app, this would mirror the UserRead schema from the backend.
interface DbUser {
    id: string;
    email: string;
    full_name: string;
    role: 'user' | 'admin' | 'superuser';
    country_code: string;
    // Add other relevant fields here
}

interface AuthState {
    authToken: string | null;
    dbUser: DbUser | null;
    status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
    login: (firebaseToken: string) => Promise<void>;
    logout: () => void;
    setAuthStatus: (status: AuthState['status']) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            authToken: null,
            dbUser: null,
            status: 'idle', // Initial status

            setAuthStatus: (status) => set({ status }),

            login: async (firebaseToken: string) => {
                set({ status: 'loading' });
                try {
                    // Set the token for the API client
                    setAuthHeader(firebaseToken);

                    // Fetch user profile from our backend
                    const response = await apiClient.get<DbUser>('/users/me');

                    // On success, update the state
                    set({
                        authToken: firebaseToken,
                        dbUser: response.data,
                        status: 'authenticated',
                    });
                    console.log('User successfully logged in and profile fetched.');
                } catch (error) {
                    console.error('Login failed:', error);
                    clearAuthHeader(); // Clear header on failure
                    set({
                        authToken: null,
                        dbUser: null,
                        status: 'unauthenticated',
                    });
                    // Re-throw the error to be handled by the UI
                    throw new Error("Failed to fetch user profile.");
                }
            },

            logout: () => {
                console.log('Logging out user.');
                clearAuthHeader();
                set({
                    authToken: null,
                    dbUser: null,
                    status: 'unauthenticated',
                });
                // Here you would also call Firebase to sign the user out.
            },
        }),
        {
            name: 'quantumpay-auth-storage', // Name of the item in AsyncStorage
            storage: createJSONStorage(() => AsyncStorage), // Use AsyncStorage for persistence
        }
    )
);