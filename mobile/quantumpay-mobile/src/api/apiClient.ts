import axios from 'axios';

// IMPORTANT: For Android Emulator, the backend is at 10.0.2.2.
// For physical devices on the same Wi-Fi, use your computer's local IP address.
// For production, this would be your live API domain.
const API_BASE_URL = 'http://10.0.2.2:8080'; // Replace with your backend port if different

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 15000,
});

// Helper functions to manage the auth header dynamically
export const setAuthHeader = (token: string) => {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAuthHeader = () => {
    delete apiClient.defaults.headers.common['Authorization'];
};