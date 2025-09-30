// FILE: src/hooks/useApi.js

import { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../api/axiosConfig';
import { toast } from 'react-hot-toast';

/**
 * A generic hook for making GET requests.
 * It is responsible ONLY for fetching data and reporting state (data, loading, error).
 * It does NOT perform UI side effects like showing toasts.
 */
export const useApi = (url, options = {}, manual = false) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(!manual);
    
    // Memoize the stringified options to prevent re-running the effect unnecessarily.
    const optionsString = useMemo(() => JSON.stringify(options), [options]);

    const request = useCallback(async (requestOptions) => {
        setLoading(true);
        setError(null);
        try {
            const finalOptions = { ...JSON.parse(optionsString), ...requestOptions };
            const response = await apiClient(url, { method: 'GET', ...finalOptions });
            setData(response.data);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || 'Could not fetch data.';
            const structuredError = { message: errorMessage, status: err.response?.status };
            setError(structuredError);
            
            // [THE DEFINITIVE FIX]
            // REMOVED the toast.error() call from this hook.
            // The component consuming this hook is responsible for displaying the error.
            
            return { success: false, error: structuredError };
        } finally {
            setLoading(false);
        }
    }, [url, optionsString]);

    useEffect(() => {
        if (!manual) {
            request();
        }
    }, [request, manual]);

    return { data, error, loading, request };
};

/**
 * A hook for making state-changing requests (POST, PUT, DELETE).
 * It IS responsible for showing UI side effects (toasts) because it's
 * tied to a direct user action (e.g., clicking "Save").
 */
export const useApiPost = (url, config = {}) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
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
            toast.error(errorMessage); // This is correct for an action-based hook.
            return { success: false, error: structuredError };
        } finally {
            setLoading(false);
        }
    }, [url, configString]);

    return { post, data, loading, error };
};

export default useApi;
