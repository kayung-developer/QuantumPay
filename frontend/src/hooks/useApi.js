// FILE: src/hooks/useApi.js

import { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../api/axiosConfig';
import { toast } from 'react-hot-toast';

export const useApi = (url, options = {}, manual = false) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(!manual);

    const request = useCallback(async (requestOptions) => {
        setLoading(true);
        setError(null);
        try {
            const finalOptions = { ...options, ...requestOptions };
            const response = await apiClient(url, { method: 'GET', ...finalOptions });
            setData(response.data);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || 'Could not fetch data.';
            const structuredError = { message: errorMessage, status: err.response?.status };
            setError(structuredError);
            toast.error(errorMessage); // Ensure errors are always toasted
            return { success: false, error: structuredError };
        } finally {
            setLoading(false);
        }
    }, [url, JSON.stringify(options)]); // Memoize based on url and options

    useEffect(() => {
        if (!manual) {
            request();
        }
    }, [request, manual]);

    return { data, error, loading, request };
};

export const useApiPost = (url, config = {}) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const post = useCallback(async (postData, requestConfig = {}) => {
        setLoading(true);
        setError(null);
        try {
            const finalConfig = { ...config, ...requestConfig };
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
            return { success: false, error: structuredError };
        } finally {
            setLoading(false);
        }
    }, [url, JSON.stringify(config)]);

    return { post, data, loading, error };
};

export default useApi;
