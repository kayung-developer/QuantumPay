import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosConfig';
import { toast } from 'react-hot-toast'; // We only need the core toast object
import { useAuth } from '../context/AuthContext';

// [THE FIX] A more stable way to handle object dependencies in hooks.
// This prevents the infinite loop by ensuring the string only changes when the content actually changes.
import { useMemo } from 'react';

/**
 * Custom hook for making GET API requests.
 * Handles loading, error, and data states silently without showing toasts.
 *
 * @param {string} url - The API endpoint to fetch data from.
 * @param {object} [options={}] - Optional Axios config (e.g., params).
 * @param {boolean} [manual=false] - If true, request is not fired on mount.
 */
export const useApi = (url, options = {}, manual = false) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(!manual);
    const { authToken } = useAuth();

    // [THE FIX] Memoize the stringified options to create a stable dependency.
    const optionsString = useMemo(() => JSON.stringify(options), [options]);

    const request = useCallback(async (requestOptions) => {
        setLoading(true);
        setError(null);
        try {
            const finalOptions = { ...JSON.parse(optionsString), ...requestOptions };
            const response = await apiClient(url, {
                method: 'GET',
                headers: { Authorization: `Bearer ${authToken}` },
                ...finalOptions,
            });
            setData(response.data);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || 'Could not fetch data.';
            const structuredError = {
                message: errorMessage,
                status: err.response?.status,
                data: err.response?.data
            };
            setError(structuredError);
            // [THE FIX] GET requests should not show error toasts by default,
            // as they often load in the background. The component can decide to show an error UI.
            console.error(`API GET Error on ${url}:`, structuredError);
            return { success: false, error: structuredError };
        } finally {
            setLoading(false);
        }
    }, [url, authToken, optionsString]);

    useEffect(() => {
        if (!manual) {
            request();
        }
    }, [request, manual]);

    return { data, error, loading, request };
};

/**
 * Custom hook for making data-mutating API requests (POST, PUT, DELETE).
 * Automatically shows specific success or error toasts.
 *
 * @param {string} url - The base API endpoint.
 * @param {object} [config={}] - Default Axios config for the hook instance (e.g., method).
 */
export const useApiPost = (url, config = {}) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { authToken } = useAuth();
    
    // [THE FIX] Memoize the config string for a stable dependency.
    const configString = useMemo(() => JSON.stringify(config), [config]);

    const post = useCallback(async (postData, requestConfig = {}) => {
        setLoading(true);
        setError(null);
        try {
            const baseConfig = JSON.parse(configString);
            const finalConfig = { ...baseConfig, ...requestConfig };
            const method = finalConfig.method?.toLowerCase() || 'post';
            const finalUrl = finalConfig.url || url;

            const response = await apiClient({
                url: finalUrl,
                method: method,
                data: postData,
                headers: { Authorization: `Bearer ${authToken}` },
                ...finalConfig.headers, // Allow overriding headers
            });

            setData(response.data);

            // [THE FIX] This logic is now robust. It only shows toasts for actions.
            if (response.data && typeof response.data === 'object' && response.data.message) {
                toast.success(response.data.message);
            }
            // NO GENERIC "SUCCESS!" TOAST. The backend should always provide a message for success feedback.

            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || 'An API error occurred.';
            const structuredError = {
                message: errorMessage,
                status: err.response?.status,
                data: err.response?.data
            };
            setError(structuredError);
            toast.error(errorMessage); // Show an error toast for all failed actions.
            console.error(`API POST/PUT/DELETE Error on ${url}:`, structuredError);
            return { success: false, error: structuredError };
        } finally {
            setLoading(false);
        }
    }, [url, authToken, configString]);

    return { post, data, loading, error };
};

export default useApi;
