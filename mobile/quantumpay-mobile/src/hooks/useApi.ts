import { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast/mobile';

// A simple in-memory cache to hold the results of GET requests.
// In a more advanced app, you might use a library like MMKV for persistent caching.
const apiCache = new Map<string, any>();

// --- TypeScript Definitions ---
interface ApiError {
    message: string;
    status?: number;
    data?: any;
}

interface UseApiOptions {
    manual?: boolean; // If true, the hook will not fetch data on mount.
    cacheResponse?: boolean; // Determines if the response should be stored in the cache.
    refetchOnFocus?: boolean; // Refetches data every time the screen comes into focus.
}

interface UseApiResponse<T> {
    data: T | null;
    error: ApiError | null;
    loading: boolean;
    request: (isRefetch?: boolean) => Promise<{ success: boolean; data?: T; error?: ApiError }>;
}


// --- The Main Data Fetching Hook (for GET requests) ---
const useApi = <T = any>(url: string | null, options: UseApiOptions = {}): UseApiResponse<T> => {
    const { manual = false, cacheResponse = true, refetchOnFocus = true } = options;

    // State for the hook's return values
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<ApiError | null>(null);
    const [loading, setLoading] = useState(!manual);

    // Use a ref to store the URL. This prevents the effects from re-running
    // unnecessarily if the component re-renders with the same URL.
    const urlRef = useRef(url);
    urlRef.current = url;

    const fetchData = useCallback(async (isRefetch = false): Promise<{ success: boolean; data?: T; error?: ApiError }> => {
        const currentUrl = urlRef.current;
        if (!currentUrl) {
            setData(null);
            setLoading(false);
            return { success: false, error: { message: "No URL provided." } };
        }

        // If this is a background refetch (like from useFocusEffect) and we already have data,
        // we don't want to show a full-screen loading spinner. The UI can handle this gracefully.
        // We only set loading to true on the initial fetch.
        if (!isRefetch) {
            setLoading(true);
        }
        setError(null);

        try {
            const response = await apiClient.get<T>(currentUrl);
            setData(response.data);
            if (cacheResponse) {
                apiCache.set(currentUrl, response.data); // Update the cache with fresh data
            }
            return { success: true, data: response.data };
        } catch (err: any) {
            const structuredError: ApiError = {
                message: err.response?.data?.detail || err.message || 'A network error occurred.',
                status: err.response?.status,
                data: err.response?.data,
            };
            setError(structuredError);
            console.error(`API GET Error on ${currentUrl}:`, structuredError);
            return { success: false, error: structuredError };
        } finally {
            setLoading(false);
        }
    }, [cacheResponse]);

    // Effect for the initial fetch when the component mounts
    useEffect(() => {
        const currentUrl = urlRef.current;
        if (!manual && currentUrl) {
            // [STALE-WHILE-REVALIDATE]
            // Instantly load data from the cache if it exists for a snappy UX.
            if (cacheResponse && apiCache.has(currentUrl)) {
                setData(apiCache.get(currentUrl));
            }
            // Then, always trigger a fetch to get the latest data.
            fetchData(false);
        }
    }, [manual, fetchData, cacheResponse]);

    // Effect for refetching data automatically when the user navigates back to the screen
    useFocusEffect(
        useCallback(() => {
            const currentUrl = urlRef.current;
            if (refetchOnFocus && currentUrl && !manual) {
                // We pass `true` to indicate this is a background refetch.
                fetchData(true);
            }
        }, [refetchOnFocus, fetchData, manual])
    );

    return { data, error, loading, request: fetchData };
};


// --- The Hook for Mutations (POST, PUT, DELETE) ---
interface UseApiPostResponse<T> {
    post: (postData: any, requestConfig?: any) => Promise<{ success: boolean; data?: T; error?: ApiError }>;
    data: T | null;
    loading: boolean;
    error: ApiError | null;
}

export const useApiPost = <T = any>(url: string, config: any = {}): UseApiPostResponse<T> => {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<ApiError | null>(null);
    const [loading, setLoading] = useState(false);

    const post = useCallback(async (postData: any, requestConfig: any = {}): Promise<{ success: boolean; data?: T; error?: ApiError }> => {
      setLoading(true);
      setError(null);
      try {
        const finalConfig = { ...config, ...requestConfig };
        const method = finalConfig.method ? finalConfig.method.toLowerCase() : 'post';

        let response;
        const finalUrl = finalConfig.url || url;

        if (method === 'put') {
            response = await apiClient.put<T>(finalUrl, postData, finalConfig);
        } else if (method === 'delete') {
            response = await apiClient.delete<T>(finalUrl, finalConfig);
        } else {
            response = await apiClient.post<T>(finalUrl, postData, finalConfig);
        }

        setData(response.data);

        // Don't show a success toast for DELETE by default
        if (method !== 'delete' && response.status !== 204) {
            // @ts-ignore - Check if response data has a message
            toast.success(response.data.message || 'Operation successful!');
        }

        return { success: true, data: response.data };
      } catch (err: any) {
        const structuredError: ApiError = {
            message: err.response?.data?.detail || err.message || 'An API error occurred.',
            status: err.response?.status,
            data: err.response?.data,
        };
        setError(structuredError);

        console.error(`API ${config.method || 'POST'} Error on ${url}:`, structuredError);
        toast.error(structuredError.message);
        return { success: false, error: structuredError };
      } finally {
        setLoading(false);
      }
    }, [url, JSON.stringify(config)]);

    return { post, data, loading, error };
};


export default useApi;