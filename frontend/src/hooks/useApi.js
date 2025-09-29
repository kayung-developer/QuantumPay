// FILE: src/hooks/useApi.js

import { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../api/axiosConfig';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for making GET API requests.
 * It is now "auth-aware" and waits for the user to be authenticated before firing.
 */
export const useApi = (url, options = {}, manual = false) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(!manual);
    // [THE FIX] We now depend on `isAuthenticated`, a reliable boolean from AuthContext,
    // not the async `authToken` state.
    const { isAuthenticated } = useAuth();
    const optionsString = useMemo(() => JSON.stringify(options), [options]);

    const request = useCallback(async (requestOptions) => {
        setLoading(true);
        setError(null);
        try {
            const finalOptions = { ...JSON.parse(optionsString), ...requestOptions };
            // The Axios interceptor now handles adding the token header automatically.
            const response = await apiClient(url, { method: 'GET', ...finalOptions });
            setData(response.data);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || 'Could not fetch data.';
            const structuredError = { message: errorMessage, status: err.response?.status };
            setError(structuredError);
            console.error(`API GET Error on ${url}:`, structuredError);
            return { success: false, error: structuredError };
        } finally {
            setLoading(false);
        }
    }, [url, optionsString]);

    useEffect(() => {
        // This effect now runs only when it's not manual AND the user is confirmed to be authenticated.
        if (!manual && isAuthenticated) {
            request();
        }
        // If not authenticated, it waits. If the user logs in, `isAuthenticated` becomes true,
        // and this hook will re-run, triggering the fetch.
    }, [request, manual, isAuthenticated]);

    return { data, error, loading, request };
};

/**
 * Custom hook for making data-mutating API requests (POST, PUT, DELETE).
 */
export const useApiPost = (url, config = {}) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth(); // <-- [THE FIX] Depend on the boolean
    const configString = useMemo(() => JSON.stringify(config), [config]);

    const post = useCallback(async (postData, requestConfig = {}) => {
        setLoading(true);
        setError(null);

        // [THE DEFINITIVE FIX] The guard clause is now simpler and more reliable.
        // It checks the synchronous boolean `isAuthenticated`.
        if (!isAuthenticated) {
            const errorMessage = "You must be logged in to perform this action.";
            toast.error(errorMessage);
            setError({ message: errorMessage });
            setLoading(false);
            return { success: false, error: { message: errorMessage } };
        }
        
        try {
            const baseConfig = JSON.parse(configString);
            const finalConfig = { ...baseConfig, ...requestConfig };
            const method = finalConfig.method?.toLowerCase() || 'post';
            const finalUrl = finalConfig.url || url;

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
            const structuredError = { message: errorMessage, status: err.response?.status };
            setError(structuredError);
            toast.error(errorMessage);
            console.error(`API POST/PUT/DELETE Error on ${url}:`, structuredError);
            return { success: false, error: structuredError };
        } finally {
            setLoading(false);
        }
    }, [url, isAuthenticated, configString]);

    return { post, data, loading, error };
};

export default useApi;
