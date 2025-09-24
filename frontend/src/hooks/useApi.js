import { useState, useCallback, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import { toastSuccess, toastError } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for making GET API requests.
 * Handles loading, error, and data states automatically.
 *
 * @param {string} url - The API endpoint to fetch data from.
 * @param {object} [options] - Optional configuration.
 * @param {boolean} [options.manual=false] - If true, the request is not fired on mount and must be triggered manually.
 * @returns {{data: any, loading: boolean, error: object, request: function}}
 */
export const useApi = (url, options = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(!options.manual);
    const [error, setError] = useState(null);
    const { authToken } = useAuth();

    const request = useCallback(async (requestOptions = {}) => {
        setLoading(true);
        setError(null);
        try {
            const finalUrl = requestOptions.url || url;
            const response = await apiClient.get(finalUrl, {
                headers: { Authorization: `Bearer ${authToken}` },
                ...requestOptions,
            });
            setData(response.data);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || 'Could not fetch data.';
            toastError(errorMessage);
            setError({ message: errorMessage });
            return { success: false, error: { message: errorMessage } };
        } finally {
            setLoading(false);
        }
    }, [url, authToken]);

    useEffect(() => {
        if (!options.manual) {
            request();
        }
    }, [options.manual, request]);

    return { data, loading, error, request };
};

/**
 * Custom hook for making POST, PUT, DELETE API requests.
 * Provides a `post` function to trigger the request.
 * Automatically handles loading, error, and data states, and displays specific toasts.
 *
 * @param {string} url - The base API endpoint for the request.
 * @param {object} [options] - Optional configuration like the HTTP method.
 * @param {string} [options.method='POST'] - The HTTP method to use (POST, PUT, DELETE).
 * @returns {{post: function, loading: boolean, data: any, error: object}}
 */
export const useApiPost = (url, options = {}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const { authToken } = useAuth();
    const method = options.method || 'POST';

    const post = useCallback(async (payload, requestOptions = {}) => {
        setLoading(true);
        setError(null);
        setData(null);

        try {
            const finalUrl = requestOptions.url || url;
            const config = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                ...requestOptions,
            };

            const response = await apiClient(finalUrl, { ...config, data: payload });

            // [DEFINITIVE FIX] This is the core of the new system.
            // It checks for a specific message from the backend and uses the custom toast.
            // Generic "Success!" toasts are no longer shown.
            if (response.data && response.data.message) {
                toastSuccess(response.data.message);
            }

            setData(response.data);
            return { success: true, data: response.data };
        } catch (err) {
            // Use the specific error message from the backend, or fall back gracefully.
            const errorMessage = err.response?.data?.detail || err.message || 'An unexpected error occurred.';
            
            // [DEFINITIVE FIX] Use the custom error toast for all failures.
            toastError(errorMessage);
            
            setError({ message: errorMessage });
            return { success: false, error: { message: errorMessage, fullError: err } };
        } finally {
            setLoading(false);
        }
    }, [url, method, authToken]);

    return { post, loading, data, error };
};

export default useApi;
