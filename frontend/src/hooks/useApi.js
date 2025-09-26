import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosConfig';
import { Toaster, toast, resolveValue } from 'react-hot-toast';

const useApi = (url, options = {}, manual = false) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!manual);

  const fetchData = useCallback(async (requestOptions) => {
    setLoading(true);
    setError(null);
    try {
      const finalOptions = { ...options, ...requestOptions };
      const response = await apiClient(url, finalOptions);
      setData(response.data);

      // RESOLUTION: The automatic success toasts have been removed from here.
      // The component using the hook will now decide if a toast is needed.

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
      setError(structuredError);

      console.error(`API Error on ${url}:`, structuredError);
      // You should also handle error toasts consistently. Consider showing it here or in the component.
      // toast.error(errorMessage); // This is in your original 'useApiPost', you might want it here too.
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

        // RESOLUTION: The automatic success toasts have been removed from here.
        // The calling component will now decide whether to show a toast message.
        // This gives you full control over the user experience.

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
        toast.error(errorMessage); // Error toast remains, as this is usually desired.
        return { success: false, error: { message: errorMessage, status: err.response?.status, data: err.response?.data } };
      } finally {
        setLoading(false);
      }
    }, [url, JSON.stringify(config)]);

    return { post, data, loading, error };
  };


export default useApi;
