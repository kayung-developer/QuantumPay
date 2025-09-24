import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { useNotification } from '../context/NotificationContext';

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
      setData(response.data);


      // 1. Check if the response data is an object and has a 'message' key.
      if (response.data && typeof response.data === 'object' && response.data.message) {
      toast.success(response.data.message);
       }
      // 2. Provide a sensible default for other successful actions, but ignore 204 No Content.
      else if (response.status !== 204) {
      toast.success('Success!');
      }
      // For DELETE or 204 No Content, no success toast is needed by default.
    return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'An API error occurred.';
      const errorStatus = err.response?.status;
      const errorData = err.response?.data;

      // We create the same structured error object, just without the TypeScript type.
      const structuredError = {
          message: errorMessage,
          status: errorStatus,
          data: errorData
      };
      setError(structuredError);

      console.error(`API Error on ${url}:`, structuredError);
      return { success: false, error: structuredError };
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(options)]);

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
    const { notifySuccess, notifyError } = useNotification(); // <-- Get notification functions from context

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

            // --- [THE ADVANCED IMPLEMENTATION] ---
            // Use specific messages from the backend if they exist.
            if (response.data && response.data.message) {
                notifySuccess(response.data.message); // The main message
            } else if (response.status !== 204) {
                // Provide a smart default for other cases
                notifySuccess('Operation Successful', 'Your changes have been saved.');
            }
            // For DELETE (204), we don't show a notification by default,
            // the calling component can choose to show one.

            return { success: true, data: response.data };

        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || 'An API error occurred.';
            const errorStatus = err.response?.status;

            // [THE ADVANCED IMPLEMENTATION] Show a detailed error notification.
            notifyError(errorMessage, `Status: ${errorStatus || 'Network Error'}`);

            const structuredError = { message: errorMessage, status: errorStatus, data: err.response?.data };
            setError(structuredError);
            return { success: false, error: structuredError };
        } finally {
            setLoading(false);
        }
    }, [url, JSON.stringify(config), notifySuccess, notifyError]);

    return { post, data, loading, error };
};


export default useApi;
