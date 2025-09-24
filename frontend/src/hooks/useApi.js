import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosConfig';
import { toastSuccess, toastError } from '../components/common/Toast';

// This is a plain JavaScript file, so we remove the TypeScript interface.
// The structure of the error object will be the same, just without the explicit type definition.

const useApi = (url, options = {}, manual = false) => {
  const [data, setData] = useState(null);
  // The state hook does not need the type annotation.
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!manual);

  const fetchData = useCallback(async (requestOptions) => {
    setLoading(true);
    setError(null);
    try {
      const finalOptions = { ...options, ...requestOptions };
      const response = await apiClient(url, finalOptions);

      if (response.data && response.data.message) {
                toastSuccess(response.data.message);
            }
            // If there's no message, we don't show a generic "success" toast anymore.
            // A success is implied by the UI updating.

            setData(response.data);
            return { success: true, data: response.data };
        } catch (err) {
            // [THE FIX] Use the new specific error toast
            const errorMessage = err.response?.data?.detail || err.message || 'An unknown error occurred.';
            toastError(errorMessage);
            setError({ message: errorMessage });
            return { success: false, error: { message: errorMessage } };
        } finally {
            setLoading(false);
        }
    }, [url, options]);

  useEffect(() => {
    if (!manual) {
      fetchData();
    }
  }, [fetchData, manual]);

  return { data, error, loading, request: fetchData };
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
        const method = finalConfig.method ? finalConfig.method.toLowerCase() : 'post';

        let response;
        const finalUrl = finalConfig.url || url;

        if (method === 'put') {
            response = await apiClient.put(finalUrl, postData, finalConfig);
        } else if (method === 'delete') {
            response = await apiClient.delete(finalUrl, finalConfig);
        } else {
            response = await apiClient.post(finalUrl, postData, finalConfig);
        }

        setData(response.data);

        // --- [THE DEFINITIVE FIX] ---
        // 1. Check if the response data is an object and has a 'message' key.
        //    Many of our backend endpoints return a success message (e.g., {"message": "User updated successfully"}).
        if (response.data && typeof response.data === 'object' && response.data.message) {
            toast.success(response.data.message);
        }
        // 2. Provide a sensible default for endpoints that don't return a message (like DELETE).
        else if (method !== 'delete' && response.status !== 204) {
            toast.success('Operation successful!');
        }
        // For DELETE or 204 No Content, no success toast is needed.

        return { success: true, data: response.data };
      } catch (err) {
        const errorMessage = err.response?.data?.detail || err.message || 'An API error occurred.';
        const errorStatus = err.response?.status;
        const errorData = err.response?.data;

        const structuredError = {
            message: errorMessage,
            status: errorStatus,
            data: errorData
        };
        setError({ message: errorMessage, status: err.response?.status, data: err.response?.data });
        toast.error(errorMessage);
        return { success: false, error: { message: errorMessage, status: err.response?.status, data: err.response?.data } };
      } finally {
        setLoading(false);
      }
    }, [url, JSON.stringify(config)]);

    return { post, data, loading, error };
  };


export default useApi;
