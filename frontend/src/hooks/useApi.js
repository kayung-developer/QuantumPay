import { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../api/axiosConfig';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for making GET API requests.
 * This version is robust against auth race conditions.
 *
 * @param {string} url - The API endpoint to fetch data from.
 * @param {object} [options={}] - Optional Axios config (e.g., params).
 * @param {boolean} [manual=false] - If true, request is not fired on mount.
 */
export const useApi = (url, options = {}, manual = false) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [dataLoading, setDataLoading] = useState(!manual); // This is for the API call itself
    
    // [THE DEFINITIVE FIX - Part 1]
    // We get the master loading state from the AuthContext.
    const { authToken, loading: authLoading } = useAuth();

    const optionsString = useMemo(() => JSON.stringify(options), [options]);

    const request = useCallback(async (requestOptions) => {
        if (!authToken) return { success: false, error: { message: "Not authenticated." } };

        setDataLoading(true);
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
            setDataLoading(false);
        }
    }, [url, authToken, optionsString]);

    useEffect(() => {
        // [THE DEFINITIVE FIX - Part 2]
        // This effect ONLY runs the request if:
        // 1. It's not a manual hook.
        // 2. The main authentication has FINISHED (authLoading is false).
        // 3. We have a valid authToken.
        if (!manual && !authLoading && authToken) {
            request();
        }
    }, [request, manual, authLoading, authToken]); // Dependencies ensure this logic runs at the right time.

    // [THE DEFINITIVE FIX - Part 3]
    // The component using this hook is "loading" if the auth is loading OR if the specific API call is loading.
    const loading = manual ? dataLoading : (authLoading || dataLoading);

    return { data, error, loading, request };
};

/**
 * Custom hook for making data-mutating API requests (POST, PUT, DELETE).
 */
export const useApiPost = (url, config = {}) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { authToken } = useAuth();
    
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
