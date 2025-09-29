// FILE: src/hooks/useApi.js

import { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../api/axiosConfig';
import { toast } from 'react-hot-toast';
// [THE FIX] We no longer need useAuth here, simplifying the hook.

/**
 * Custom hook for making GET API requests.
 */
export const useApi = (url, options = {}, manual = false) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(!manual);
    const optionsString = useMemo(() => JSON.stringify(options), [options]);

    const request = useCallback(async (requestOptions) => {
        setLoading(true);
        setError(null);
        try {
            const finalOptions = { ...JSON.parse(optionsString), ...requestOptions };
            // The Axios interceptor handles adding the token header automatically.
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
        // [THE DEFINITIVE FIX] This effect now runs once on mount if not manual.
        // It trusts the Axios interceptor to attach the token if it exists.
        // If the user is not logged in, the interceptor does nothing, the API
        // returns a 401, and the `error` state is correctly set.
        // This is a simpler and more robust pattern.
        if (!manual) {
            request();
        }
    }, [request, manual]); // The dependency array is now simpler.

    return { data, error, loading, request };
};

/**
 * Custom hook for making data-mutating API requests (POST, PUT, DELETE).
 */
export const useApiPost = (url, config = {}) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const configString = useMemo(() => JSON.stringify(config), [config]);

    const post = useCallback(async (postData, requestConfig = {}) => {
        setLoading(true);
        setError(null);
        
        // [THE DEFINITIVE FIX] The guard clause is removed. We trust the interceptor.
        // If the user tries to POST while logged out, the API will correctly reject
        // with a 401, and the error will be caught and displayed as a toast.
        
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
    }, [url, configString]);

    return { post, data, loading, error };
};

export default useApi;
