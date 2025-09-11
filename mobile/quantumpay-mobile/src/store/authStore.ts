import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, setAuthHeader, clearAuthHeader } from '../api/apiClient';

// Define the shapes of our data
interface Wallet {
    id: string;
    currency_code: string;
    balance: number;
}

interface Transaction {
    id: string;
    amount: number;
    currency_code: string;
    description: string;
    status: string;
    transaction_type: string;
    sender_id?: string;
    receiver_id?: string;
    created_at: string; // ISO 8601 string
}

interface DbUser {
    id: string;
    email: string;
    full_name: string;
    role: 'user' | 'admin' | 'superuser';
    country_code: string;
}

interface AppDataState {
    wallets: Wallet[];
    transactions: Transaction[];
    fetchAppData: () => Promise<void>;
}

interface AuthState {
    authToken: string | null;
    dbUser: DbUser | null;
    status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
    login: (firebaseToken: string) => Promise<void>;
    logout: () => void;
    register: (email, password, fullName, countryCode, phoneNumber) => Promise<void>;
    setAuthStatus: (status: AuthState['status']) => void;
}

// We will combine both auth and app data into a single store for simplicity
export const useAppStore = create<AuthState & AppDataState>()(
    persist(
        (set, get) => ({
            // Auth State
            authToken: null,
            dbUser: null,
            status: 'idle',

            // App Data State
            wallets: [],
            transactions: [],

            setAuthStatus: (status) => set({ status }),

            login: async (firebaseToken: string) => {
                set({ status: 'loading' });
                try {
                    setAuthHeader(firebaseToken);
                    const response = await apiClient.get<DbUser>('/users/me');
                    set({
                        authToken: firebaseToken,
                        dbUser: response.data,
                        status: 'authenticated',
                    });
                    // After successful login, immediately fetch app data
                    await get().fetchAppData();
                } catch (error) {
                    console.error('Login failed:', error);
                    clearAuthHeader();
                    set({ authToken: null, dbUser: null, status: 'unauthenticated' });
                    throw new Error("Failed to fetch user profile.");
                }
            },

            logout: () => {
                clearAuthHeader();
                set({
                    authToken: null,
                    dbUser: null,
                    status: 'unauthenticated',
                    wallets: [], // Clear app data on logout
                    transactions: [],
                });
            },

                        register: async (email, password, fullName, countryCode, phoneNumber) => {
                // This function is called AFTER Firebase user creation on the client.
                // Its job is to sync the new user with our backend.
                try {
                    const user = auth.currentUser;
                    if (!user) throw new Error("Firebase user not found after creation.");

                    const token = await user.getIdToken();
                    setAuthHeader(token); // Set auth header for the backend call

                    // Call our backend to complete the registration and create the DB record
                    await apiClient.post('/auth/complete-registration', {
                        firebase_uid: user.uid,
                        email: email,
                        full_name: fullName,
                        country_code: countryCode,
                        phone_number: phoneNumber,
                    });

                    // After successfully creating the DB record, call the login function
                    // to fetch the new user profile and app data, completing the session.
                    await get().login(token);

                } catch (error) {
                    console.error("Backend registration failed:", error);
                    // If backend registration fails, we should sign the user out of Firebase
                    // to prevent an inconsistent state.
                    await auth.signOut();
                    clearAuthHeader();
                    set({ status: 'unauthenticated' });
                    throw new Error("Failed to create QuantumPay profile.");
                }
            },

            fetchAppData: async () => {
                try {
                    console.log("Fetching latest app data (wallets & transactions)...");
                    // Fetch wallets and transactions in parallel for performance
                    const [walletsResponse, transactionsResponse] = await Promise.all([
                        apiClient.get<Wallet[]>('/wallets/me'),
                        apiClient.get<Transaction[]>('/transactions/history?limit=5')
                    ]);

                    set({
                        wallets: walletsResponse.data,
                        transactions: transactionsResponse.data
                    });
                } catch (error) {
                    console.error("Failed to fetch app data:", error);
                    // Don't log the user out, just let the UI handle the error
                }
            },
        }),
        {
            name: 'quantumpay-app-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);