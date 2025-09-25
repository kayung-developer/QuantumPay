import { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../api/axiosConfig';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for making GET API requests.
 * It is now "auth-aware" and will wait for an auth token before firing to prevent race conditions.
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

    // [THE FIX - Part 1] Memoize the stringified options to create a stable dependency.
    // This prevents the hook from refetching on every parent component re-render.
    const optionsString = useMemo(() => JSON.stringify(options), [options]);

    const request = useCallback(async (requestOptions) => {
        if (!authToken) {
            // Wait for authentication to complete to prevent race conditions on page load.
            return { success: false, error: { message: "Authentication token not yet available." } };
        }
        
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
            const structuredError = { message: errorMessage, status: err.response?.status, data: err.response?.data };
            setError(structuredError);
            console.error(`API GET Error on ${url}:`, structuredError);
            return { success: false, error: structuredError };
        } finally {
            setLoading(false);
        }
    }, [url, authToken, optionsString]);

    useEffect(() => {
        // This effect now only runs if it's not manual AND the authToken exists.
        // It will re-run correctly if the authToken changes from null to a real token.
        if (!manual && authToken) {
            request();
        }
        if (!authToken && !manual) {
            setLoading(false);
        }
    }, [request, manual, authToken]);

    return { data, error, loading, request };
};

/**
 * Custom hook for making data-mutating API requests (POST, PUT, DELETE).
 * Automatically shows specific success or error toasts with de-duplication.
 */
export const useApiPost = (url, config = {}) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { authToken } = useAuth();
    
    // [THE FIX - Part 1] Memoize the config string for a stable dependency.
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
                ...finalConfig.headers,
            });

            setData(response.data);

            if (response.data && typeof response.data === 'object' && response.data.message) {
                // [THE FIX - Part 2] Add a unique ID to the toast call.
                // This tells react-hot-toast to not render a new toast if one with the same ID is already visible.
                toast.success(response.data.message, { id: response.data.message });
            }

            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || 'An API error occurred.';
            const structuredError = { message: errorMessage, status: err.response?.status, data: err.response?.data };
            setError(structuredError);

            // [THE FIX - Part 2] Add a unique ID to the error toast as well.
            toast.error(errorMessage, { id: errorMessage });

            console.error(`API POST/PUT/DELETE Error on ${url}:`, structuredError);
            return { success: false, error: structuredError };
        } finally {
            setLoading(false);
        }
    }, [url, authToken, configString]);

    return { post, data, loading, error };
};

export default useApi;
