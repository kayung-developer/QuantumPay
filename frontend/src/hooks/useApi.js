// FILE: src/hooks/useApi.js

import { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../api/axiosConfig';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext'; // <-- Import useAuth

/**
 * Custom hook for making GET API requests.
 * It is now "auth-aware" and will wait for an auth token before firing automatically.
 */
export const useApi = (url, options = {}, manual = false) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(!manual);
    const { authToken } = useAuth(); // <-- Get the token from our reliable context
    const optionsString = useMemo(() => JSON.stringify(options), [options]);

    const request = useCallback(async (requestOptions) => {
        // [THE FIX] The useEffect below now waits for the authToken, but we also
        // add a guard here for manual requests for extra safety.
        if (!authToken) {
            console.warn("useApi request called manually without an auth token.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const finalOptions = { ...JSON.parse(optionsString), ...requestOptions };
            // We no longer need to manually add the header here, as axiosConfig now has it by default.
            const response = await apiClient(url, { method: 'GET', ...finalOptions });
            setData(response.data);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || 'Could not fetch data.';
            const structuredError = { message: errorMessage, status: err.response?.status, data: err.response?.data };
            setError(structuredError);
            console.error(`API GET Error on ${url}:`, structuredError);
            return { success: false, error: structuredError };
        } finally {
            setLoading(false);
        }
    }, [url, authToken, optionsString]);

    useEffect(() => {
        // [THE DEFINITIVE FIX - PART 2A: GET HOOK]
        // This effect will now ONLY run if it's not manual AND if the authToken exists.
        // It prevents the initial automatic fetch from firing too early.
        if (!manual && authToken) {
            request();
        }
        // If there's no token yet, it does nothing and waits for a re-render
        // which will happen when the AuthContext provides the token.
    }, [request, manual, authToken]); // <-- authToken is now a dependency

    return { data, error, loading, request };
};

/**
 * Custom hook for making data-mutating API requests (POST, PUT, DELETE).
 */
export const useApiPost = (url, config = {}) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { authToken } = useAuth(); // <-- Get the token from our reliable context
    const configString = useMemo(() => JSON.stringify(config), [config]);

    const post = useCallback(async (postData, requestConfig = {}) => {
        setLoading(true);
        setError(null);

        // --- [THE DEFINITIVE FIX - PART 2B: POST HOOK] ---
        // This guard clause is the most critical fix for user-triggered actions.
        // It prevents any API call from being made if the authentication token
        // hasn't loaded yet, solving the "token: b'undefined'" error.
        if (!authToken) {
            const errorMessage = "Authentication is not ready. Please wait a moment and try again.";
            toast.error(errorMessage);
            setError({ message: errorMessage });
            setLoading(false);
            return { success: false, error: { message: errorMessage } };
        }
        // --- [END OF FIX] ---

        try {
            const baseConfig = JSON.parse(configString);
            const finalConfig = { ...baseConfig, ...requestConfig };
            const method = finalConfig.method?.toLowerCase() || 'post';
            const finalUrl = finalConfig.url || url;

            // Again, no need to manually add the header. It's on the axios instance.
            const response = await apiClient({
                url: finalUrl,
                method: method,
                data: postData,
                ...finalConfig,
            });

            setData(response.data);

            if (response.data && typeof response.data === 'object' && response.data.message) {
                toast.success(response.data.message);
            }
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || 'An API error occurred.';
            const structuredError = { message: errorMessage, status: err.response?.status, data: err.response?.data };
            setError(structuredError);
            toast.error(errorMessage);
            console.error(`API POST/PUT/DELETE Error on ${url}:`, structuredError);
            return { success: false, error: structuredError };
        } finally {
            setLoading(false);
        }
    }, [url, authToken, configString]);

    return { post, data, loading, error };
};

export default useApi;